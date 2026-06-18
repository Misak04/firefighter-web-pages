import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { TechnicsService } from './technics.service';
import { TechnicsController } from './technics.controller';

@Module({
  imports: [MediaModule],
  controllers: [TechnicsController],
  providers: [TechnicsService],
})
export class TechnicsModule {}
