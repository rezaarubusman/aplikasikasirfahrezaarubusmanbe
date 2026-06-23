import { PrismaClient } from "../../../generated/prisma/client.js";
import { CreateProductDTO } from "./dto/products.dto.js";
import { UpdateProductDTO } from "./dto/products.dto.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";

export class ProductService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService
  ) {}
  
  create = async (body: CreateProductDTO, file?: Express.Multer.File) => {
    let imageUrl: string | undefined = undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        "cashier-app/products" 
      );
      imageUrl = uploadResult.url;
    }

    if (body.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: body.categoryId,
          isDeleted: false,
        },
      });

      if (!category) {
        throw new ApiError("Category not found", 404);
      }
    }

    const product = await this.prisma.product.create({
      data: {
          name: body.name,
          description: body.description,
          price: body.price,
          stock: body.stock ?? 0,
          image: imageUrl, 
          categoryId: body.categoryId,
        },
        include: {
          category: true,
        },
      });
    return {
      message: "Product created",
      data: product,
    };
  };

  findAll = async () => {
    const products = await this.prisma.product.findMany({
      where: {
          isDeleted: false,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return products;
  };

  findById = async (id: string) => {
    const product = await this.prisma.product.findFirst({
      where: {
          id,
          isDeleted: false,
        },
        include: {
          category: true,
        },
      });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return product;
  };

  update = async (id: string, body: UpdateProductDTO, file?: Express.Multer.File) => {
    await this.prisma.product.findUnique({
      where: { id },
    });

    if (body.name) {
      const existingProductWithName = await this.prisma.product.findFirst({
        where: { name: body.name, id: { not: id }, isDeleted: false },
      });
      if (existingProductWithName) throw new ApiError("Product name already exists", 400);
    }

    const existingProduct = await this.findById(id);
    let imageUrl: string | null | undefined = existingProduct.image;

    if (file) {
      if (existingProduct.image) {
        await this.cloudinaryService.deleteByUrl(existingProduct.image);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(file, "cashier-app/products");
      imageUrl = uploadResult.url;
    } else if (body.image === null || body.image === "") {
      if (existingProduct.image) {
        await this.cloudinaryService.deleteByUrl(existingProduct.image);
      }
      imageUrl = null;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: { ...body, image: imageUrl }, 
    });
    return {
      message: "Product updated",
      data: product,
    };
  };

  delete = async (
    id: string) => {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new ApiError("Product not found", 404);
    }

    if (existingProduct.image) {
      await this.cloudinaryService.deleteByUrl(existingProduct.image);
    }

    await this.findById(id);

    await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        image: null, 
      },
    });

    return {
      message: "Product deleted",
    };
  };
}