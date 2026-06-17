import { Role } from "../../generated/prisma/enums.js";

export type AuthUser = {
  id: string;
  role: Role;
};
