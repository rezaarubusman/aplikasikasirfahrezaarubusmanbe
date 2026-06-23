import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { CategoryService } from "./category.service.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./dto/category.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class CategoryController {
  constructor(
    private service: CategoryService
  ) {}

  private parseId(idParam: string): number {
    const id = Number(idParam);
    if (isNaN(id)) {
      throw new ApiError("Invalid category ID format", 400);
    }
    return id;
  }

  create = async ( req: Request, res: Response ) => {
    const body = plainToInstance(CreateCategoryDTO, req.body);

    const result = await this.service.create(body);

    res.status(201).send(result);
  };

  getAll = async ( req: Request, res: Response ) => { 
    const result = await this.service.findAll();

    res.status(200).send(result);
  };

  getById = async ( req: Request<{ id: string }>, res: Response ) => {
    const id = this.parseId(req.params.id);
    const result = await this.service.findById(id);

    res.status(200).send(result);
  };

  update = async ( req: Request<{ id: string }>, res: Response ) => {
    const id = this.parseId(req.params.id);
    const body = plainToInstance(UpdateCategoryDTO, req.body);

    const result = await this.service.update(id, body);

    res.status(200).send(result);
  };

  delete = async ( req: Request<{ id: string }>, res: Response ) => {
    const id = this.parseId(req.params.id);
    
    const result = await this.service.delete(id);

    res.status(200).send(result);
  };
}