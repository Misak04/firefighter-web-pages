import { BadRequestException, Body, Controller, Delete, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { AccessTokenPayload } from '../auth/auth.types';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Roles(Role.EDITOR, Role.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('eventId') eventId: string,
    @Body('year', ParseIntPipe) year: number,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const user = req.user as AccessTokenPayload;
    const media = await this.mediaService.upload(file, {
      prefix: `gallery/${year}/${eventId}`,
      uploadedById: user.sub,
    });
    return this.mediaService.withPresignedUrls(media);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
}
