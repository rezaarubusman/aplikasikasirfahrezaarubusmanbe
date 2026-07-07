import express, { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { LoginDTO, RegisterDTO } from "./dto/auth.dto.js";

export class AuthRouter {
  private router: Router;

  constructor(
    private controller: AuthController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware
  ) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = (): void => {
    this.router.post(
      "/register",
      this.validationMiddleware.validateBody(RegisterDTO),
      this.controller.register
    );

    this.router.post(
      "/login",
      this.validationMiddleware.validateBody(LoginDTO),
      this.controller.login
    );

    this.router.post(
      "/logout",
      this.authMiddleware.verifyToken,
      this.controller.logout
    );

    this.router.get(
      "/me",
      this.authMiddleware.verifyToken,
      this.controller.me
    );
  };

  getRouter = (): Router => this.router;
}