import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { PaymentMethod } from "../../../../generated/prisma/enums.js";

export class CreateTransactionItemDTO {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateTransactionDTO {
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ValidateIf((body) => body.paymentMethod === PaymentMethod.CASH)
  @IsNumber()
  @Min(0)
  cashTendered?: number;

  @ValidateIf((body) => body.paymentMethod === PaymentMethod.DEBIT)
  @IsString()
  @IsNotEmpty()
  debitCardNumber?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDTO)
  items!: CreateTransactionItemDTO[];
}

export class FindTransactionQueryDTO {
  @IsOptional()
  @IsString()
  shiftId?: string;
}
