import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  publicationYear: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  coverImageId?: number;

  /** @deprecated ใช้ coverImageId แทน - legacy */
  @IsOptional()
  @IsString()
  coverImage?: string;
}
