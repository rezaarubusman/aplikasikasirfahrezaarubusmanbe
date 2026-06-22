import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { InventoryService } from "./inventory.service.js";
import { CreateStockMovementDTO } from "./dto/inventory.dto.js";

export class InventoryController {
  constructor(private service: InventoryService) {}

  create = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateStockMovementDTO, req.body);
    
    const userId = res.locals.user.id; 

    const result = await this.service.create(body, userId);
    res.status(201).send(result);
  };

  getAll = async (req: Request, res: Response) => {
    const productId = req.query.productId as string | undefined;
    
    const result = await this.service.findAll(productId);
    res.status(200).send(result);
  };
}