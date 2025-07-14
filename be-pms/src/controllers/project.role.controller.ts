import { Request, Response } from "express";
import mongoose from "mongoose";
import projectRoleService from "../services/project.role.service";

class ProjectRoleController {
  getAllProjectRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectRoles = await projectRoleService.getAllProjectRoles();
      res.json({
        success: true,
        data: projectRoles,
        message: "Lấy danh sách role thành công",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getProjectRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({
          success: false,
          message: "ID role không hợp lệ",
        });
        return;
      }

      const projectRole = await projectRoleService.getProjectRoleById(
        new mongoose.Types.ObjectId(id)
      );

      if (!projectRole) {
        res.status(404).json({
          success: false,
          message: "Role không tồn tại",
        });
        return;
      }

      res.json({
        success: true,
        data: projectRole,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  createProjectRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, projectpermissionIds } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Tên role là bắt buộc",
        });
        return;
      }

      const newProjectRole = await projectRoleService.createProjectRole({
        name,
        projectpermissionIds,
      });

      res.status(201).json({
        success: true,
        data: newProjectRole,
        message: "Tạo role thành công",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateProjectRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({
          success: false,
          message: "ID role không hợp lệ",
        });
        return;
      }

      const updatedProjectRole = await projectRoleService.updateProjectRole(
        new mongoose.Types.ObjectId(id),
        updateData
      );

      if (!updatedProjectRole) {
        res.status(404).json({
          success: false,
          message: "Role không tồn tại",
        });
        return;
      }

      res.json({
        success: true,
        data: updatedProjectRole,
        message: "Cập nhật role thành công",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  deleteProjectRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({
          success: false,
          message: "ID role không hợp lệ",
        });
        return;
      }

      const isDeleted = await projectRoleService.deleteProjectRole(
        new mongoose.Types.ObjectId(id)
      );

      if (!isDeleted) {
        res.status(404).json({
          success: false,
          message: "Role không tồn tại",
        });
        return;
      }

      res.json({
        success: true,
        message: "Xóa role thành công",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

export default new ProjectRoleController();
