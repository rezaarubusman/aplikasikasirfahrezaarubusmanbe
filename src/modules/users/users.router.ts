import express, { Router } from "express";
import { UsersController } from "./users.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CreateUserDTO, UpdateUserDTO } from "./dto/users.dto.js";

export class UsersRouter {
  private router: Router;

  constructor(
    private controller: UsersController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware
  ) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = (): void => {
    // Terapkan middleware auth ke semua route users
    this.router.use(this.authMiddleware.verifyToken);

    this.router.get(
      "/",
      this.controller.getAll
    );

    this.router.get(
      "/:id",
      this.controller.getById
    );

    this.router.post(
      "/",
      this.validationMiddleware.validateBody(CreateUserDTO),
      this.controller.create
    );

    this.router.patch(
      "/:id",
      this.validationMiddleware.validateBody(UpdateUserDTO),
      this.controller.update
    );

    this.router.delete(
      "/:id",
      this.controller.delete
    );
  };

  getRouter = (): Router => this.router;
}