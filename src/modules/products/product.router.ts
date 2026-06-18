import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { ProductController } from "./product.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { UploadMiddleware } from "../../middlewares/upload.middleware.js";
import { CreateProductDTO } from "./dto/products.dto.js";
import { UpdateProductDTO } from "./dto/products.dto.js";

export class ProductRouter {
  private router: Router;

  constructor(
    private controller: ProductController,
    private validation: ValidationMiddleware,
    private auth: AuthMiddleware,
    private upload: UploadMiddleware
  ) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/",
      this.auth.verifyToken,
      this.controller.findAll
    );

    this.router.get(
      "/:id",
      this.auth.verifyToken,
      this.controller.findOne
    );

    this.router.post(
      "/",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.ADMIN),
      this.upload.uploadImage().single("image"), // Middleware untuk mengunggah satu file gambar dengan nama field 'image'
      this.validation.validateBody(CreateProductDTO),
      this.controller.create
    );

    this.router.patch(
      "/:id",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.ADMIN),
      this.upload.uploadImage().single("image"), // Middleware untuk mengunggah satu file gambar dengan nama field 'image'
      this.validation.validateBody(UpdateProductDTO), // Validasi body setelah upload
      this.controller.update
    );

    this.router.delete(
      "/:id",
      this.auth.verifyToken,
      this.auth.verifyRole(Role.ADMIN),
      this.controller.delete
    );
  };

  getRouter = (): Router =>
    this.router;
}