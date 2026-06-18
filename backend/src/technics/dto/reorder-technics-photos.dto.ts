import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class TechnicsPhotoOrderEntry {
  @IsString()
  id!: string;

  @IsInt()
  sortOrder!: number;
}

export class ReorderTechnicsPhotosDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TechnicsPhotoOrderEntry)
  photos!: TechnicsPhotoOrderEntry[];
}
