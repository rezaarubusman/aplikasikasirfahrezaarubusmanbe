import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js"
import { CategoryController } from "./category.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./dto/category.dto.js";

export class CategoryRouter {
  private router: Router;

  constructor(
    private controller: CategoryController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware
  ) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = (): void => {
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
      this.authMiddleware.verifyRole(Role.ADMIN),
      this.validationMiddleware.validateBody(CreateCategoryDTO),
      this.controller.create
    );

    this.router.patch(
      "/:id",
      this.authMiddleware.verifyRole(Role.ADMIN),
      this.validationMiddleware.validateBody(UpdateCategoryDTO),
      this.controller.update
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.verifyRole(Role.ADMIN),
      this.controller.delete
    );
  };

  getRouter = (): Router => this.router;
}