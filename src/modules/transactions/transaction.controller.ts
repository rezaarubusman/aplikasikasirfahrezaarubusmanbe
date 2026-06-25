import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { AuthUser } from "../../types/auth-user.type.js";
import { TransactionService } from "./transaction.service.js";
import { CreateTransactionDTO, FindTransactionQueryDTO } from "./dto/transaction.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class TransactionController {
  constructor(private service: TransactionService) {}

  private getUser = (res: Response): AuthUser => res.locals.user ?? res.locals.existingUser;

  private validateInput = async (dtoInstance: any) => {
    const errors = await validate(dtoInstance);
    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      throw new ApiError(messages.join(", "), 400);
    }
  };

  create = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateTransactionDTO, req.body);
    await this.validateInput(body);

    const result = await this.service.create(this.getUser(res).id, body);
    res.status(201).send(result);
  };

  findAll = async (req: Request, res: Response) => {
    const query = plainToInstance(FindTransactionQueryDTO, req.query);
    await this.validateInput(query);

    const result = await this.service.findAll(query, this.getUser(res));
    res.status(200).send(result);
  };

  findOne = async (req: Request<{ id: string }>, res: Response) => { 
    const result = await this.service.findById(req.params.id, this.getUser(res));
    res.status(200).send(result);
  };
}