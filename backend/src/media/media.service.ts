import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as sharp from 'sharp';
import { randomUUID } from 'crypto';
import { MinioService } from './minio.service';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

interface UploadContext {
  prefix: string;
  uploadedById: string;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  async upload(file: { mimetype: string; size: number; buffer: Buffer; originalname: string }, ctx: UploadContext) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type. Allowed: JPEG, PNG, WebP.');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File exceeds the 20 MB upload limit.');
    }

    const id = randomUUID();
    const prefix = `gallery/${ctx.year}/${ctx.eventId}`;

    // .rotate() auto-orients from EXIF before re-encoding; sharp strips all metadata
    // (including EXIF) on output unless .withMetadata() is explicitly called, so the
    // visual orientation is preserved even though the EXIF block itself is removed.
    const original = await sharp(file.buffer).rotate().toBuffer();
    const small = await sharp(file.buffer).rotate().resize({ width: 300 }).webp().toBuffer();
    const medium = await sharp(file.buffer).rotate().resize({ width: 800 }).webp().toBuffer();

    const originalKey = `${prefix}/original/${id}`;
    const thumbSmallKey = `${prefix}/small/${id}.webp`;
    const thumbMediumKey = `${prefix}/medium/${id}.webp`;

    await this.minio.putObject(originalKey, original, file.mimetype);
    await this.minio.putObject(thumbSmallKey, small, 'image/webp');
    await this.minio.putObject(thumbMediumKey, medium, 'image/webp');

    return this.prisma.media.create({
      data: {
        filename: file.originalname,
        originalKey,
        thumbSmallKey,
        thumbMediumKey,
        size: file.size,
        mimeType: file.mimetype,
        uploadedById: ctx.uploadedById,
      },
    });
  }

  async withPresignedUrls<T extends { originalKey: string; thumbSmallKey: string; thumbMediumKey: string }>(
    media: T,
  ): Promise<T & { originalUrl: string; thumbSmallUrl: string; thumbMediumUrl: string }> {
    const [originalUrl, thumbSmallUrl, thumbMediumUrl] = await Promise.all([
      this.minio.presignedGetUrl(media.originalKey),
      this.minio.presignedGetUrl(media.thumbSmallKey),
      this.minio.presignedGetUrl(media.thumbMediumKey),
    ]);
    return { ...media, originalUrl, thumbSmallUrl, thumbMediumUrl };
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    await this.minio.removeObjects([media.originalKey, media.thumbSmallKey, media.thumbMediumKey]);
    await this.prisma.media.delete({ where: { id: mediaId } });
  }
}
