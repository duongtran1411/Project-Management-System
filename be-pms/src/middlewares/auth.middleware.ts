import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import ProjectContributor from "../models/project.contributor.model";
import ProjectRole from "../models/project.role.model";
import Task from "../models/task.model";

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
      res.status(401).json({ message: "Quyền truy cập bị từ chối" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("role");

    if (!user) {
      res.status(401).json({ message: "Tài khoản không tồn tại" });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: "Tài khoản đã bị khóa" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export const authorize = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Yêu cầu quyền truy cập" });
    }

    // Đảm bảo role đã được populate
    const userRole = req.user.role as any;
    if (!userRole || userRole.name !== role) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện hành động này",
      });
    }

    next();
  };
};

export const authorizeProjectRole = (requiredRole: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Yêu cầu quyền truy cập" });
      }

      let projectId = req.params.projectId || req.body.projectId;

      if (!projectId && req.params.taskId) {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
          return res.status(404).json({ message: "Task không tồn tại" });
        }
        projectId = task.projectId?.toString();
      }

      if (!projectId) {
        return res
          .status(400)
          .json({ message: "Không xác định được projectId" });
      }

      const contributor = await ProjectContributor.findOne({
        userId: req.user._id,
        projectId,
      });

      if (!contributor) {
        return res
          .status(403)
          .json({ message: "Bạn không tham gia project này" });
      }

      const projectRole = await ProjectRole.findById(contributor.projectRoleId);
      if (!projectRole || projectRole.name !== requiredRole) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền thực hiện hành động này" });
      }

      next();
    } catch (error) {
      console.error("authorizeProjectRole error:", error);
      res.status(500).json({ message: "Lỗi phân quyền project" });
    }
  };
};
