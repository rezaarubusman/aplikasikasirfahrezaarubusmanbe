import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums.js";
import { ApiError } from "../utils/api-error.js";

interface JwtPayload {
  id: string;
  username: string;
  role: Role;
}

export class AuthMiddleware {
  verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return next(
        new ApiError(
          "No token provided",
          401
        )
      );
    }

    const token =
      authHeader.split(" ")[1];

    try {
      const payload =
        jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as JwtPayload;

      res.locals.existingUser =
        payload;
      res.locals.user =
        payload;

      next();
    } catch (err) {
      if (
        err instanceof
        jwt.TokenExpiredError
      ) {
        return next(
          new ApiError(
            "Token expired",
            401
          )
        );
      }

      return next(
        new ApiError(
          "Token invalid",
          401
        )
      );
    }
  };

  verifyRole = (...roles: Role[]) => {
    return (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const userRole =
        res.locals.existingUser?.role;

      if (
        !userRole ||
        !roles.includes(userRole)
      ) {
        return next(
          new ApiError(
            "You don't have access to this resource",
            403
          )
        );
      }
      next();
    };
  };
}
