import express, { Router } from "express";
import { InventoryController } from "./inventory.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CreateStockMovementDTO } from "./dto/inventory.dto.js";

export class InventoryRouter {
  private router: Router;

  constructor(
    private controller: InventoryController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware
  ) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = (): void => {
    // Wajib login untuk akses inventaris
    this.router.use(this.authMiddleware.verifyToken);
    this.router.use(this.authMiddleware.verifyRole("ADMIN"));

    this.router.get(
      "/",
      this.controller.getAll
    );

    this.router.post(
      "/",
      this.validationMiddleware.validateBody(CreateStockMovementDTO),
      this.controller.create
    );
  };

  getRouter = (): Router => this.router;
}