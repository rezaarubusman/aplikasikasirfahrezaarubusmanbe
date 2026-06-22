import express, { Router } from "express";
import { ReportController } from "./reports.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { DateRangeDTO } from "./dto/reports.dto.js";

export class ReportRouter {
  private router: Router;

  constructor(
    private controller: ReportController,
    private authMiddleware: AuthMiddleware,
    private validationMiddleware: ValidationMiddleware
  ) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = (): void => {
    this.router.use(this.authMiddleware.verifyToken);
    this.router.use(this.authMiddleware.verifyRole("ADMIN"));

    this.router.get(
      "/sales",
      this.validationMiddleware.validateQuery(DateRangeDTO),
      this.controller.getSalesSummary
    );

    this.router.get(
      "/top-products",
      this.validationMiddleware.validateQuery(DateRangeDTO),
      this.controller.getTopProducts
    );

    this.router.get(
      "/shift-discrepancies",
      this.validationMiddleware.validateQuery(DateRangeDTO),
      this.controller.getShiftDiscrepancies
    );

    this.router.get(
      "/dashboard",
      this.controller.getDashboardStats
    );
  };

  getRouter = (): Router => this.router;
}