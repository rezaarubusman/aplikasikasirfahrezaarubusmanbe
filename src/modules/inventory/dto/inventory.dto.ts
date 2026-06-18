import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  NotEquals,
} from "class-validator";
import { StockMovementType } from "../../../../generated/prisma/enums.js";

export class CreateStockMovementDTO {
  @IsString()
  @IsNotEmpty({ message: "Product ID is required" })
  productId!: string;

  @IsInt()
  @NotEquals(0, { message: "Quantity cannot be zero" })
  qty!: number;

  @IsEnum(StockMovementType, {
    message: "Type must be IN, OUT, or ADJUSTMENT",
  })
  @IsNotEmpty({ message: "Movement type is required" })
  type!: StockMovementType;

  @IsOptional()
  @IsString()
  notes?: string;
}