import { PartialType } from '@nestjs/mapped-types';
import { CreateTechnicsDto } from './create-technics.dto';

export class UpdateTechnicsDto extends PartialType(CreateTechnicsDto) {}
