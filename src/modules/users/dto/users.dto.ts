import { Allow, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { Role } from "../../../../generated/prisma/enums.js";

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: "Username is required" })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password!: string;

  @IsNotEmpty({ message: "Role is required" })
  @IsEnum(Role, { message: "Role must be ADMIN or CASHIER" })
  role!: Role;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Allow()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password?: string;

  @IsOptional()
  @IsEnum(Role, { message: "Role must be ADMIN or CASHIER" })
  role?: Role;
}

export class UserQueryDTO {
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
  @IsEnum(Role)
  role?: Role;
}