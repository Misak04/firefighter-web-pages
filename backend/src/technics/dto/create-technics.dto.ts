import { IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { TechnicsCategory, TechnicsStatus } from '../../../generated/prisma/enums';

export class CreateTechnicsDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(TechnicsCategory)
  category!: TechnicsCategory;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearAcquired?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  specs?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(TechnicsStatus)
  status?: TechnicsStatus;
}
