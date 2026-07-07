import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { AuthUser } from "../../types/auth-user.type.js";
import { LoginDTO,  RegisterDTO } from "./dto/auth.dto.js";

export class AuthController {
  constructor(
    private service: AuthService
  ) {}

  private getUser = (res: Response): AuthUser => res.locals.user ?? res.locals.existingUser;

  register = async (req: Request, res: Response) => {
    const body = plainToInstance(RegisterDTO, req.body);

    const result = await this.service.register(body);

    res.status(201).send(result);
  };

  login = async (req: Request, res: Response) => {
    const body = plainToInstance(LoginDTO, req.body);

    const result = await this.service.login(body);

    res.status(200).send(result);
  };

  me = async (req: Request, res: Response) => {
    const result = await this.service.me(this.getUser(res).id);

    res.status(200).send(result);
  };

  logout = async (req: Request, res: Response) => {
    const user = this.getUser(res);
    await this.service.logout(user.id);

    res.status(200).send({
      message: "Logout success",
    });
  };
}