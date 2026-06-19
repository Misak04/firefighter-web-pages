import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MediaService } from './media.service';
import { ClamAvService } from './clamav.service';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [MinioService, MediaService, ClamAvService],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
