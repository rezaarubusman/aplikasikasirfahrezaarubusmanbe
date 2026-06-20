import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ShiftService } from "./shift.service.js";
import { OpenShiftDTO } from "./dto/shift.dto.js";
import { CloseShiftDTO } from "./dto/shift.dto.js";

export class ShiftController {
  constructor(
    private service: ShiftService
  ) {}

  openShift = async (req: Request, res: Response) => {
    const body = plainToInstance(OpenShiftDTO, req.body);

    const result = await this.service.openShift(res.locals.user.id, body);

    res.status(201).send(result);
  };

  closeShift = async (req: Request<{ id: string }>, res: Response) => {
    const body = plainToInstance(CloseShiftDTO, req.body);

    const result = await this.service.closeShift(
      req.params.id,
      body
    );

    res.status(200).send(result);
  };

  findAll = async (req: Request, res: Response) => {
    const result = await this.service.findAll();

    res.status(200).send(result);
  };

  findOne = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.findById(
      req.params.id
    );

    res.status(200).send(result);
  };

  getActiveShift = async (req: Request, res: Response) => {
  const userId = res.locals.user.id; 
  
  const result = await this.service.getActiveShift(userId);

  if (!result) {
    return res.status(404).json({ message: "Tidak ada shift aktif" });
  }

  res.status(200).send(result);
}
}