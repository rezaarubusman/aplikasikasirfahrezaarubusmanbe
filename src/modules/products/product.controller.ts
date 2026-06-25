import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ProductService } from "./product.service.js";
import { CreateProductDTO, UpdateProductDTO, ProductQueryDTO } from "./dto/products.dto.js";
import { UploadMiddleware } from "../../middlewares/upload.middleware.js";
import { ApiError } from "../../utils/api-error.js";

export class ProductController {
  constructor(
    private service: ProductService,
    private uploadMiddleware: UploadMiddleware
  ) {}

  private validateInput = async (dtoInstance: any) => {
    const errors = await validate(dtoInstance);
    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      throw new ApiError(messages.join(", "), 400);
    }
  };

  create = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateProductDTO, req.body);
    await this.validateInput(body);
    
    const file = req.file;

    const result = await this.service.create(body, file);

    res.status(201).send(result);
  };

  findAll = async (req: Request, res: Response) => {
    const query = plainToInstance(ProductQueryDTO, req.query);
    await this.validateInput(query);

    const result = await this.service.findAll(query);

    res.status(200).send(result);
  };

  findOne = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.findById(req.params.id);

    res.status(200).send(result);
  };

  update = async (req: Request<{ id: string }>, res: Response) => {
    const body = plainToInstance(UpdateProductDTO, req.body);
    await this.validateInput(body);

    const file = req.file;

    const result = await this.service.update(req.params.id, body, file);

    res.status(200).send(result);
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.delete(req.params.id);

    res.status(200).send(result);
  };
}