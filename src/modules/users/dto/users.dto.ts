import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
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