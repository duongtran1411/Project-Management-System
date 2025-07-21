import { Role } from "../role/role.model";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar: string;
  status: "ACTIVE" | "INACTIVE" | string;
  failedLoginAttempts: number;
  verified: boolean;
  role: Role;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
