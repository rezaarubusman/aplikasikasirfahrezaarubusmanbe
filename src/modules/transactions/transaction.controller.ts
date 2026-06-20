import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { AuthUser } from "../../types/auth-user.type.js";
import { TransactionService } from "./transaction.service.js";
import {
  CreateTransactionDTO,
  FindTransactionQueryDTO,
} from "./dto/transaction.dto.js";

export class TransactionController {
  constructor(
    private service: TransactionService
  ) {}

  create = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateTransactionDTO, req.body);

    const result = await this.service.create(this.getUser(res).id, body);

    res.status(201).send(result);
  };

  findAll = async (req: Request, res: Response) => {
    const query = plainToInstance(FindTransactionQueryDTO, req.query);

    const result = await this.service.findAll(query.shiftId, this.getUser(res));

    res.status(200).send(result);
  };

  findOne = async (
    req: Request<{ id: string }>,
    res: Response
  ) => { 
    const result = await this.service.findById(req.params.id, this.getUser(res));

    res.status(200).send(result);
  };

  private getUser = (res: Response): AuthUser => res.locals.user ?? res.locals.existingUser;
}
