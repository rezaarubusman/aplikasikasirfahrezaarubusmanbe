import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ProductService } from "./product.service.js";
import { CreateProductDTO } from "./dto/products.dto.js";
import { UpdateProductDTO } from "./dto/products.dto.js";
import { UploadMiddleware } from "../../middlewares/upload.middleware.js";

export class ProductController {
  constructor(
    private service: ProductService,
    private uploadMiddleware: UploadMiddleware
  ) {}

  create = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateProductDTO, req.body);
    
    const file = req.file;

    const result = await this.service.create(
      body,
      file
    );

    res.status(201).send(result);
  };

  findAll = async (
    req: Request,
    res: Response
  ) => {
    const result = await this.service.findAll();

    res.status(200).send(result);
  };

  findOne = async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    const result = await this.service.findById(req.params.id);

    res.status(200).send(result);
  };

  update = async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    const body = plainToInstance(UpdateProductDTO, req.body);

    const file = req.file;

    const result = await this.service.update(
      req.params.id,
      body,
      file
    );

    res.status(200).send(result);
  };

  delete = async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    const result = await this.service.delete(req.params.id);

    res.status(200).send(result);
  };
}