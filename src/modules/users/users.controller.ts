import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { UsersService } from "./users.service.js";
import { CreateUserDTO, UpdateUserDTO, UserQueryDTO } from "./dto/users.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class UsersController {
  constructor(private service: UsersService) {}

  private validateInput = async (dtoInstance: any) => {
    const errors = await validate(dtoInstance);
    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      throw new ApiError(messages.join(", "), 400);
    }
  };

  create = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateUserDTO, req.body);
    await this.validateInput(body);

    const result = await this.service.create(body);
    res.status(201).send(result);
  };

  getAll = async (req: Request, res: Response) => {
    const query = plainToInstance(UserQueryDTO, req.query);
    await this.validateInput(query);

    const result = await this.service.findAll(query);
    res.status(200).send(result);
  };

  getById = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.findById(req.params.id);
    res.status(200).send(result);
  };

  update = async (req: Request<{ id: string }>, res: Response) => {
    const body = plainToInstance(UpdateUserDTO, req.body);
    await this.validateInput(body);

    const result = await this.service.update(req.params.id, body);
    res.status(200).send(result);
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.delete(req.params.id);
    res.status(200).send(result);
  };
}