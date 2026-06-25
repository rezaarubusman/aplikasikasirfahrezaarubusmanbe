import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, Max } from "class-validator";

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

export class ProductQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "Page minimal 1" })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: "Limit maksimal 100 data per request" })
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}