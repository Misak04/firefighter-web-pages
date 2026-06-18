import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, ValidateNested } from 'class-validator';

class PhotoOrderEntry {
  @IsString()
  id!: string;

  sortOrder!: number;
}

export class ReorderPhotosDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PhotoOrderEntry)
  photos!: PhotoOrderEntry[];
}
