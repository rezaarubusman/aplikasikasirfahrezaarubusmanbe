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

    // Endpoint: GET /api/reports/sales?startDate=2024-01-01&endDate=2024-01-31
    this.router.get(
      "/sales",
      this.validationMiddleware.validateQuery(DateRangeDTO),
      this.controller.getSalesSummary
    );

    // Endpoint: GET /api/reports/top-products?startDate=2024-01-01&endDate=2024-01-31
    this.router.get(
      "/top-products",
      this.validationMiddleware.validateQuery(DateRangeDTO),
      this.controller.getTopProducts
    );

    // Endpoint: GET /api/reports/shift-discrepancies?startDate=...&endDate=...&cashierId=...
    this.router.get(
      "/shift-discrepancies",
      this.validationMiddleware.validateQuery(DateRangeDTO),
      this.controller.getShiftDiscrepancies
    );
  };

  getRouter = (): Router => this.router;
}