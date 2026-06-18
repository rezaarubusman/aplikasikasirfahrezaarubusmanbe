import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { TransactionController } from "./transaction.controller.js";
import {
  CreateTransactionDTO,
  FindTransactionQueryDTO,
} from "./dto/transaction.dto.js";

export class TransactionRouter {
  private router: Router;

  constructor(
    private controller: TransactionController,
    private validation: ValidationMiddleware,
    private auth: AuthMiddleware
  ) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.CASHIER, Role.ADMIN),
      this.validation.validateBody(CreateTransactionDTO),
      this.controller.create
    );

    this.router.get(
      "/",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.ADMIN),
      this.validation.validateQuery(FindTransactionQueryDTO),
      this.controller.findAll
    );

    this.router.get(
      "/:id",
      this.auth.verifyToken,
      this.controller.findOne
    );
  };

  getRouter = (): Router =>
    this.router;
}