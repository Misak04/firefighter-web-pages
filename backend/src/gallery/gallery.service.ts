import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async listYears(): Promise<number[]> {
    const events = await this.prisma.event.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });
    return events.map((e) => e.year);
  }

  async listEventsForYear(year: number) {
    return this.prisma.event.findMany({
      where: { year },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listPhotosForEvent(eventId: string, page: number, limit: number) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const skip = (page - 1) * limit;
    const [photos, total] = await Promise.all([
      this.prisma.photo.findMany({
        where: { eventId },
        include: { media: true },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.photo.count({ where: { eventId } }),
    ]);

    const items = await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        media: await this.mediaService.withPresignedUrls(photo.media),
      })),
    );

    return { items, total, page, limit };
  }

  async createEvent(dto: CreateEventDto) {
    return this.prisma.event.create({ data: dto });
  }

  async updateEvent(id: string, dto: UpdateEventDto) {
    await this.findEventOrThrow(id);
    return this.prisma.event.update({ where: { id }, data: dto });
  }

  async attachPhoto(eventId: string, mediaId: string, title: string | undefined) {
    await this.findEventOrThrow(eventId);
    const maxSortOrder = await this.prisma.photo.aggregate({
      where: { eventId },
      _max: { sortOrder: true },
    });
    return this.prisma.photo.create({
      data: {
        eventId,
        mediaId,
        title,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
      include: { media: true },
    });
  }

  async reorderPhotos(eventId: string, dto: ReorderPhotosDto) {
    await this.findEventOrThrow(eventId);
    await this.prisma.$transaction(
      dto.photos.map((p) =>
        this.prisma.photo.update({ where: { id: p.id }, data: { sortOrder: p.sortOrder } }),
      ),
    );
  }

  async deletePhoto(photoId: string): Promise<void> {
    const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }
    await this.prisma.photo.delete({ where: { id: photoId } });
    await this.mediaService.deleteMedia(photo.mediaId);
  }

  async getEvent(id: string) {
    return this.findEventOrThrow(id);
  }

  private async findEventOrThrow(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }
}
