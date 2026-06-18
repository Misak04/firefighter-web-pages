import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MediaService } from './media.service';

@Module({
  providers: [MinioService, MediaService],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
