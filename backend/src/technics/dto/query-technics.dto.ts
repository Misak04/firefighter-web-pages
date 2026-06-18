import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TechnicsCategory, TechnicsStatus } from '../../../generated/prisma/enums';

export class QueryTechnicsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TechnicsCategory)
  category?: TechnicsCategory;

  @IsOptional()
  @IsEnum(TechnicsStatus)
  status?: TechnicsStatus;
}
