import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";

interface TokenPayload {
  userId: string;
  fullname: string;
  email: string;
  role: string;
  avatar?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export const generateToken = (user: IUser): string => {
  let roleName = "";
  if (user.role) {
    if (typeof user.role === "object" && user.role !== null) {
      if ("name" in user.role) {
        roleName = (user.role as any).name;
      } else {
        roleName = (user.role as any).toString();
      }
    } else {
      roleName = (user.role as any).toString();
    }
  }

  const payload: TokenPayload = {
    userId: (user._id as any).toString(),
    fullname: user.fullName,
    email: user.email,
    role: roleName,
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
  let roleName = "";
  if (user.role) {
    if (typeof user.role === "object" && user.role !== null) {
      if ("name" in user.role) {
        roleName = (user.role as any).name;
      } else {
        roleName = (user.role as any).toString();
      }
    } else {
      roleName = (user.role as any).toString();
    }
  }

  const payload: TokenPayload = {
    userId: (user._id as any).toString(),
    fullname: user.fullName,
    email: user.email,
    role: roleName,
    avatar: user.avatar,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "90d",
  } as any);
};
