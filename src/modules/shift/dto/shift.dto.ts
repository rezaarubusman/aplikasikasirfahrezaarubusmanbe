import { IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class OpenShiftDTO {
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  initialCash!: number;
}

export class CloseShiftDTO {
  @IsNumber()
  @Min(0)
  finalCash!: number;
}