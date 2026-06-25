import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { CategoryService } from "./category.service.js";
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryQueryDTO } from "./dto/category.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class CategoryController {
  constructor(private service: CategoryService) {}

  private parseId(idParam: string): number {
    const id = Number(idParam);
    if (isNaN(id)) {
      throw new ApiError("Invalid category ID format", 400);
    }
    return id;
  }

  private validateInput = async (dtoInstance: any) => {
    const errors = await validate(dtoInstance);
    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      throw new ApiError(messages.join(", "), 400);
    }
  };

  create = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateCategoryDTO, req.body);
    await this.validateInput(body);

    const result = await this.service.create(body);
    res.status(201).send(result);
  };

  getAll = async (req: Request, res: Response) => {
    const query = plainToInstance(CategoryQueryDTO, req.query);
    await this.validateInput(query);

    const result = await this.service.findAll(query);
    res.status(200).send(result);
  };

  getById = async (req: Request<{ id: string }>, res: Response) => {
    const id = this.parseId(req.params.id);
    const result = await this.service.findById(id);
    res.status(200).send(result);
  };

  update = async (req: Request<{ id: string }>, res: Response) => {
    const id = this.parseId(req.params.id);
    const body = plainToInstance(UpdateCategoryDTO, req.body);
    await this.validateInput(body);

    const result = await this.service.update(id, body);
    res.status(200).send(result);
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    const id = this.parseId(req.params.id);
    const result = await this.service.delete(id);
    res.status(200).send(result);
  };
}