import jwt from "jsonwebtoken";
import crypto from "crypto"
import { PrismaClient } from "../../../generated/prisma/client.js";
import { Role } from "../../../generated/prisma/enums.js";
import { hashPassword, comparePassword } from "../../lib/argon.js";
import { RegisterDTO, LoginDTO } from "./dto/auth.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  private generateToken(user: { id: string; username: string; role: Role }, sessionId: string ) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        sessionId,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "30m",
      }
    );
  }

  register = async (body: RegisterDTO) => {
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
          role: body.role ?? Role.CASHIER,
        },
      });

    return {
      message: "User created successfully",
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  };

  login = async (body: LoginDTO) => {
    const user = await this.prisma.user.findUnique({
      where: { username: body.username },
    });

    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }

    const isMatch = await comparePassword(body.password, user.password);

    if (!isMatch) {
      throw new ApiError("Invalid credentials", 400);
    }

    const newSessionId = crypto.randomUUID();

    await this.prisma.user.update({
      where: {id: user.id },
      data: { activeSessionId: newSessionId}
    });

    const token = this.generateToken(user, newSessionId);

    return {
      message: "Login success",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      },
    };
  };

  me = async (userId: string) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 400);
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    };
  };

  logout = async (userId: string) => {
    await this.prisma.user.update({
      where: { id: userId},
      data: {activeSessionId: null}
    });
  };
}