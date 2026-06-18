import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateTechnicsDto } from './dto/create-technics.dto';
import { UpdateTechnicsDto } from './dto/update-technics.dto';
import { QueryTechnicsDto } from './dto/query-technics.dto';
import { ReorderTechnicsPhotosDto } from './dto/reorder-technics-photos.dto';

@Injectable()
export class TechnicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(query: QueryTechnicsDto) {
    const { page, limit, category, status } = query;
    const skip = (page - 1) * limit;
    const where = {
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.technics.findMany({
        where,
        include: { photos: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.technics.count({ where }),
    ]);

    const itemsWithUrls = await Promise.all(items.map((item) => this.withPhotoUrls(item)));
    return { items: itemsWithUrls, total, page, limit };
  }

  async findOne(id: string) {
    const technics = await this.findOrThrow(id, true);
    return this.withPhotoUrls(technics);
  }

  async create(dto: CreateTechnicsDto) {
    return this.prisma.technics.create({ data: dto });
  }

  async update(id: string, dto: UpdateTechnicsDto) {
    await this.findOrThrow(id);
    return this.prisma.technics.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.technics.delete({ where: { id } });
  }

  async attachPhoto(technicsId: string, mediaId: string) {
    await this.findOrThrow(technicsId);
    const maxSortOrder = await this.prisma.technicsPhoto.aggregate({
      where: { technicsId },
      _max: { sortOrder: true },
    });
    return this.prisma.technicsPhoto.create({
      data: { technicsId, mediaId, sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1 },
      include: { media: true },
    });
  }

  async reorderPhotos(technicsId: string, dto: ReorderTechnicsPhotosDto): Promise<void> {
    await this.findOrThrow(technicsId);
    await this.prisma.$transaction(
      dto.photos.map((p) =>
        this.prisma.technicsPhoto.update({ where: { id: p.id }, data: { sortOrder: p.sortOrder } }),
      ),
    );
  }

  async deletePhoto(photoId: string): Promise<void> {
    const photo = await this.prisma.technicsPhoto.findUnique({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }
    await this.prisma.technicsPhoto.delete({ where: { id: photoId } });
    await this.mediaService.deleteMedia(photo.mediaId);
  }

  private async findOrThrow(id: string, withPhotos = false) {
    const technics = await this.prisma.technics.findUnique({
      where: { id },
      include: withPhotos ? { photos: { include: { media: true }, orderBy: { sortOrder: 'asc' } } } : undefined,
    });
    if (!technics) {
      throw new NotFoundException('Technics item not found');
    }
    return technics;
  }

  private async withPhotoUrls<T extends { photos: { media: Parameters<MediaService['withPresignedUrls']>[0] }[] }>(
    technics: T,
  ) {
    const photos = await Promise.all(
      technics.photos.map(async (photo) => ({
        ...photo,
        media: await this.mediaService.withPresignedUrls(photo.media),
      })),
    );
    return { ...technics, photos };
  }
}
