import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export interface AuthRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "No token, authorization denied" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("role");

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: "Account is deactivated" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const authorize = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authorization required" });
    }

    if (req.user.role.name !== role) {
      res.status(403).json({
        message: "You don't have permission to perform this action",
      });
    }

    next();
  };
};
