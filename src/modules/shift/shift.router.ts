import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { ShiftController } from "./shift.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { OpenShiftDTO } from "./dto/shift.dto.js";
import { CloseShiftDTO } from "./dto/shift.dto.js";

export class ShiftRouter {
    private router: Router;

    constructor(
        private controller: ShiftController,
        private validation: ValidationMiddleware,
        private auth: AuthMiddleware
    ) {
        this.router = express.Router();
        this.initRoutes();
    }
  private initRoutes = () => {

    this.router.post(
      "/open",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.CASHIER, Role.ADMIN),
      this.validation.validateBody(OpenShiftDTO),
      this.controller.openShift
    );

    this.router.patch(
      "/:id/close",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.CASHIER, Role.ADMIN),
      this.validation.validateBody(CloseShiftDTO),
      this.controller.closeShift
    );

    this.router.get(
      "/",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.ADMIN),
      this.controller.findAll
    );

    this.router.get(
      "/active",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.CASHIER, Role.ADMIN),
      this.controller.getActiveShift
    );

    this.router.get(
      "/:id",
      this.auth.verifyToken,
      this.controller.findOne
    );
  };

  getRouter = () : Router =>
      this.router;
  }