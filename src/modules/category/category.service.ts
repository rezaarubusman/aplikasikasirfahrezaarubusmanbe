import { PrismaClient } from "../../../generated/prisma/client.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./dto/category.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class CategoryService {
  constructor(
    private prisma: PrismaClient
  ) {}

  create = async (body: CreateCategoryDTO) => {
    // Opsional: Cek apakah nama kategori sudah ada agar tidak duplikat
    const existingCategory = await this.prisma.category.findFirst({
      where: { 
        name: body.name,
        isDeleted: false 
      },
    });

    if (existingCategory) {
      throw new ApiError("Category name already exists", 400);
    }

    const category = await this.prisma.category.create({
      data: {
        name: body.name,
      },
    });

    return {
      message: "Category created successfully",
      data: category,
    };
  };

  findAll = async () => {
    const categories = await this.prisma.category.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        name: 'asc' // Mengurutkan berdasarkan nama kategori sesuai abjad
      }
    });

    return {
      message: "Success fetch all categories",
      data: categories,
    };
  };

  findById = async (id: number) => {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.isDeleted) {
      throw new ApiError("Category not found", 404);
    }

    return {
      message: "Success fetch category",
      data: category,
    };
  };

  update = async (id: number, body: UpdateCategoryDTO) => {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory || existingCategory.isDeleted) {
      throw new ApiError("Category not found", 404);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return {
      message: "Category updated successfully",
      data: category,
    };
  };

  delete = async (id: number) => {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory || existingCategory.isDeleted) {
      throw new ApiError("Category not found", 404);
    }

    // Menggunakan Soft Delete
    await this.prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });

    return {
      message: "Category deleted successfully",
    };
  };
}