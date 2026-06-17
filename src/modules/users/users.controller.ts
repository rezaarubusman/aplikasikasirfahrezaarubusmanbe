import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { UsersService } from "./users.service.js";
import { CreateUserDTO, UpdateUserDTO } from "./dto/users.dto.js";

export class UsersController {
  constructor(
    private service: UsersService
  ) {}

  create = async (
    req: Request,
    res: Response
  ) => {
    const body = plainToInstance(
      CreateUserDTO,
      req.body
    );

    const result = await this.service.create(body);
    res.status(201).send(result);
  };

  getAll = async (
    req: Request,
    res: Response
  ) => {
    const result = await this.service.findAll();
    res.status(200).send(result);
  };

  getById = async (
    req: Request<{ id: string}>,
    res: Response
  ) => {
    const result = await this.service.findById(req.params.id);
    res.status(200).send(result);
  };

  update = async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    const body = plainToInstance(
      UpdateUserDTO,
      req.body
    );

    const result = await this.service.update(req.params.id, body);
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