import { IsOptional, IsString } from 'class-validator';

export class AttachPhotoDto {
  @IsString()
  mediaId!: string;

  @IsOptional()
  @IsString()
  title?: string;
}
