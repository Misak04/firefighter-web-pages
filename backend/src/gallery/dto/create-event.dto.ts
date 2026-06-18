import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
