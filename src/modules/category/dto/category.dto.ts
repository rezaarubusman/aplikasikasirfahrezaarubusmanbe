import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCategoryDTO {
  @IsString()
  @IsNotEmpty({ message: "Category name is required" })
  name!: string;
}

export class UpdateCategoryDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Category name cannot be empty" })
  name?: string;
}

export class CategoryQueryDTO {
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
}