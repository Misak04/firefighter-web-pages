import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Public()
  @Get('years')
  listYears() {
    return this.galleryService.listYears();
  }

  @Public()
  @Get('years/:year/events')
  listEventsForYear(@Param('year', ParseIntPipe) year: number) {
    return this.galleryService.listEventsForYear(year);
  }

  @Public()
  @Get('events/:id/photos')
  listPhotosForEvent(@Param('id') id: string, @Query() query: QueryArticlesDto) {
    return this.galleryService.listPhotosForEvent(id, query.page, query.limit);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Post('events')
  createEvent(@Body() dto: CreateEventDto) {
    return this.galleryService.createEvent(dto);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Patch('events/:id')
  updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.galleryService.updateEvent(id, dto);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Patch('events/:id/photos/reorder')
  reorderPhotos(@Param('id') id: string, @Body() dto: ReorderPhotosDto) {
    return this.galleryService.reorderPhotos(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('photos/:id')
  deletePhoto(@Param('id') id: string) {
    return this.galleryService.deletePhoto(id);
  }
}
