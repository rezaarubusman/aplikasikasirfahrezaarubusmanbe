import { IsNotEmpty, IsOptional, IsString } from "class-validator";

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