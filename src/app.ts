import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors.js";
import { loggerHttp } from "./lib/logger-http.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";

import { prisma } from "./lib/prisma.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import { UploadMiddleware } from "./middlewares/upload.middleware.js";
import { ValidationMiddleware } from "./middlewares/validation.middleware.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRouter } from "./modules/auth/auth.router.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { ProductController } from "./modules/products/product.controller.js";
import { ProductRouter } from "./modules/products/product.router.js";
import { ProductService } from "./modules/products/product.service.js";
import { ShiftController } from "./modules/shift/shift.controller.js";
import { shiftRouter } from "./modules/shift/shift.router.js";
import { ShiftService } from "./modules/shift/shift.service.js";
import { TransactionController } from "./modules/transactions/transaction.controller.js";
import { TransactionRouter } from "./modules/transactions/transaction.router.js";
import { TransactionService } from "./modules/transactions/transaction.service.js";

const PORT = 8000;

export class App {
  app: express.Express;

  constructor() {
    this.app = express();
    this.configure();
    this.registerModules();
    this.handleError();
  }

  private configure = () => {
    this.app.use(cors(corsOptions));
    this.app.use(loggerHttp);
    this.app.use(express.json());
  };

  private registerModules = () => {
    // shared dependency
    const prismaClient = prisma;

    //middlewares
    const authMiddleware = new AuthMiddleware();
    const validationMiddleware = new ValidationMiddleware();
    const uploadMiddleware = new UploadMiddleware();

    const authService = new AuthService(prismaClient);
    const authController = new AuthController(authService);
    const authRouter = new AuthRouter(
      authController,
      validationMiddleware,
      authMiddleware
    );

    const productService = new ProductService(prismaClient);
    const productController = new ProductController(productService);
    const productRouter = new ProductRouter(
      productController,
      validationMiddleware,
      authMiddleware
    );

    const shiftService = new ShiftService(prismaClient);
    const shiftController = new ShiftController(shiftService);
    const shiftRoute = new shiftRouter(
      shiftController,
      validationMiddleware,
      authMiddleware
    );

    const transactionService =
      new TransactionService(prismaClient);
    const transactionController =
      new TransactionController(transactionService);
    const transactionRouter =
      new TransactionRouter(
        transactionController,
        validationMiddleware,
        authMiddleware
      );

    this.app.use(
      "/auth",
      authRouter.getRouter()
    );
    this.app.use(
      "/products",
      productRouter.getRouter()
    );
    this.app.use(
      "/shifts",
      shiftRoute.getRouter()
    );
    this.app.use(
      "/transactions",
      transactionRouter.getRouter()
    );
  };

  private handleError = () => {
    this.app.use(errorMiddleware);
    this.app.use(notFoundMiddleware);
  };

  start() {
    this.app.listen(PORT, () => {
      console.log(`Server Running On Port : ${PORT}`);
    });
  }
}
