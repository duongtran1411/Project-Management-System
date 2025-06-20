import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  avatar?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: (user._id as any).toString(),
    email: user.email,
    role:
      typeof user.role === "string"
        ? user.role
        : (user.role as any)?.name || (user.role as any)?.toString() || "",
    avatar: user.avatar,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
  } as any);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: (user._id as any).toString(),
    email: user.email,
    role:
      typeof user.role === "string"
        ? user.role
        : (user.role as any)?.name || (user.role as any)?.toString() || "",
    avatar: user.avatar,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "90d",
  } as any);
};
