import { PrismaClient } from "../../../generated/prisma/client.js";
import { hashPassword } from "../../lib/argon.js";
import { CreateUserDTO, UpdateUserDTO, UserQueryDTO } from "./dto/users.dto.js";
import { ApiError } from "../../utils/api-error.js";

interface UserFilter {
  q?: string;
}

export class UsersService {
  constructor(
    private prisma: PrismaClient
  ) {}

  create = async (body: CreateUserDTO) => {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: body.username },
    });

    if (existingUser) {
      throw new ApiError("Username already exists", 400);
    }

    const hashedPassword = await hashPassword(body.password);

    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        username: body.username,
        password: hashedPassword,
        role: body.role,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      }
    });

    return {
      message: "User created successfully",
      data: user,
    };
  };

  findAll = async (query: UserQueryDTO) => {
    const { page, limit, search, role } = query;
    const skip = (page - 1) * limit;

    const whereInput: any = {
      isDeleted: false,
    };

    if (role) {
      whereInput.role = role;
    }

    if (search) {
      whereInput.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { username: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: whereInput,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: whereInput,
      }),
    ]);

    return {
      message: "Success fetch all users",
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  findById = async (id: string) => {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isDeleted: true,
      },
    });

    if (!user || user.isDeleted) {
      throw new ApiError("User not found", 404);
    }

    return {
      message: "Success fetch user",
      data: user,
    };
  };

  update = async (id: string, body: UpdateUserDTO) => {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser || existingUser.isDeleted) {
      throw new ApiError("User not found", 404);
    }

    let updatedPassword = existingUser.password;
    if (body.password) {
      updatedPassword = await hashPassword(body.password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        ...(body.password && { password: updatedPassword }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      }
    });

    return {
      message: "User updated successfully",
      data: user,
    };
  };

  delete = async (id: string) => {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser || existingUser.isDeleted) {
      throw new ApiError("User not found", 404);
    }

    // Soft delete implementation
    await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return {
      message: "User deleted successfully",
    };
  };
}