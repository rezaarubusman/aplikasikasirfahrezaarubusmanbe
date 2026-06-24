import {
  IsNumber,
  Min,
} from "class-validator";

export class OpenShiftDTO {
  @IsNumber()
  @Min(1000)
  initialCash!: number;
}

export class CloseShiftDTO {
  @IsNumber()
  @Min(0)
  finalCash!: number;
}