import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { TechnicsService } from './technics.service';
import { MediaService } from '../media/media.service';
import { CreateTechnicsDto } from './dto/create-technics.dto';
import { UpdateTechnicsDto } from './dto/update-technics.dto';
import { QueryTechnicsDto } from './dto/query-technics.dto';
import { ReorderTechnicsPhotosDto } from './dto/reorder-technics-photos.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { AccessTokenPayload } from '../auth/auth.types';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

@Controller('technics')
export class TechnicsController {
  constructor(
    private readonly technicsService: TechnicsService,
    private readonly mediaService: MediaService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryTechnicsDto) {
    return this.technicsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technicsService.findOne(id);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateTechnicsDto) {
    return this.technicsService.create(dto);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTechnicsDto) {
    return this.technicsService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicsService.remove(id);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post(':id/photos/upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async uploadPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const user = req.user as AccessTokenPayload;
    const media = await this.mediaService.upload(file, { prefix: `technics/${id}`, uploadedById: user.sub });
    return this.technicsService.attachPhoto(id, media.id);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Patch(':id/photos/reorder')
  reorderPhotos(@Param('id') id: string, @Body() dto: ReorderTechnicsPhotosDto) {
    return this.technicsService.reorderPhotos(id, dto);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Delete('photos/:photoId')
  deletePhoto(@Param('photoId') photoId: string) {
    return this.technicsService.deletePhoto(photoId);
  }
}
