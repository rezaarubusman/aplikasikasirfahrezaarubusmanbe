import { PrismaClient } from "../../../generated/prisma/client.js";
import { CreateProductDTO } from "./dto/products.dto.js";
import { UpdateProductDTO } from "./dto/products.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class ProductService {
  constructor(
    private prisma: PrismaClient
  ) {}
  
create = async (
  body: CreateProductDTO
) => {

  if (body.categoryId) {
    const category =
      await this.prisma.category.findFirst({
        where: {
          id: body.categoryId,
          isDeleted: false,
        },
      });

    if (!category) {
      throw new ApiError(
        "Category not found",
        404
      );
    }
  }

  const product =
    await this.prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock ?? 0,
        image: body.image,
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
  const products =
    await this.prisma.product.findMany({
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

findById = async (
  id: string
) => {

  const product =
    await this.prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        category: true,
      },
    });

  if (!product) {
    throw new ApiError(
      "Product not found",
      404
    );
  }

  return product;
};

update = async (
  id: string,
  body: UpdateProductDTO
) => {

  await this.findById(id);

  const product =
    await this.prisma.product.update({
      where: {
        id,
      },
      data: body,
      include: {
        category: true,
      },
    });

  return {
    message: "Product updated",
    data: product,
  };
};

delete = async (
  id: string
) => {

  await this.findById(id);

  await this.prisma.product.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  return {
    message: "Product deleted",
  };
};
}