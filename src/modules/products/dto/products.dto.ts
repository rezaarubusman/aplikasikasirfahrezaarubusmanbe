import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min
} from "class-validator";

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number) 
  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  categoryId?: number;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number) 
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  categoryId?: number;
}