import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [MinioService, MediaService],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
