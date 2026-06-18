import { Type } from "class-transformer";
import { IsDateString, IsOptional, IsString, IsNumber } from "class-validator";

export class DateRangeDTO {
  @IsOptional()
  @IsDateString({}, { message: "startDate must be a valid ISO date string" })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: "endDate must be a valid ISO date string" })
  endDate?: string;

  @IsOptional()
  @IsString({ message: "cashierId must be a string" })
  cashierId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

}