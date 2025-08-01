import { Request, Response } from "express";
import projectService from "../services/project.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import cloudinary from "../utils/cloudinary";
import fs from "fs";
export class ProjectController {
  createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const project = await projectService.createProject(req.body, req.user);
      res.status(201).json({
        success: true,
        message: "Tạo project thành công",
        data: project,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Create project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create project",
        statusCode: 400,
      });
    }
  };

  getAllProjects = async (_req: Request, res: Response): Promise<void> => {
    try {
      const projects = await projectService.getAllProjects();
      res.status(200).json({
        success: true,
        message: "Lấy danh sách project thành công",
        data: projects,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get all projects error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch projects",
        statusCode: 400,
      });
    }
  };

  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project không tồn tại",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Lấy project thành công",
        data: project,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get project by id error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch project",
        statusCode: 400,
      });
    }
  };

  updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      let iconUrl = req.body.icon;

      // Xử lý defaultAssign để tránh lỗi Cast to ObjectId
      let updateData = { ...req.body, icon: iconUrl };

      // Xử lý defaultAssign nếu có
      if (req.body.defaultAssign !== undefined) {
        if (
          req.body.defaultAssign === null ||
          req.body.defaultAssign === "null" ||
          req.body.defaultAssign === ""
        ) {
          updateData.defaultAssign = null;
        } else if (
          req.body.defaultAssign &&
          typeof req.body.defaultAssign === "string"
        ) {
          // Kiểm tra xem có phải là ObjectId hợp lệ không
          if (
            !require("mongoose").Types.ObjectId.isValid(req.body.defaultAssign)
          ) {
            res.status(400).json({
              success: false,
              message: "defaultAssign ID không hợp lệ",
              statusCode: 400,
            });
            return;
          }
        }
      }

      // Nếu có file icon upload, upload lên Cloudinary
      if (req.file) {
        try {
          const result = await cloudinary.uploadImage(req.file.path, {
            public_id: `project-icons/${id}_${Date.now()}_${
              req.file.originalname
            }`,
          });
          updateData.icon = result.url;
        } finally {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      }

      const project = await projectService.updateProject(
        id,
        updateData,
        req.user
      );
      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project không tồn tại",
          statusCode: 404,
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Cập nhật project thành công",
        data: project,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update project",
        statusCode: 400,
      });
    }
  };

  deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await projectService.deleteProject(id, req.user);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Project không tồn tại",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Xóa project thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete project error:", error);
      res.status(403).json({
        success: false,
        message: error.message || "Failed to delete project",
        statusCode: 403,
      });
    }
  };

  restoreProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await projectService.restoreProject(id);

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project không tồn tại",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Khôi phục project thành công",
        data: project,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Restore project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Khôi phục project thất bại",
        statusCode: 400,
      });
    }
  };

  getDeletedProjects = async (_req: Request, res: Response): Promise<void> => {
    try {
      const projects = await projectService.getDeletedProjects();
      res.status(200).json({
        success: true,
        message: "Lấy danh sách project đã xoá thành công",
        data: projects,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get deleted projects error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách project đã xoá thất bại",
        statusCode: 400,
      });
    }
  };

  // addMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  //   try {
  //     const { id } = req.params;
  //     const { contributors } = req.body;
  //     const user = req.user;

  //     if (!user) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Unauthorized",
  //         statusCode: 401,
  //       });
  //     }

  //     if (!contributors || !Array.isArray(contributors)) {
  //       res.status(400).json({
  //         success: false,
  //         message: "Contributors must be an array of user IDs",
  //         statusCode: 400,
  //       });
  //     }

  //     const project = await projectService.addMember(id, contributors, user);

  //     if (!project) {
  //       res.status(404).json({
  //         success: false,
  //         message: "Project not found",
  //         statusCode: 404,
  //       });
  //     }

  //     res.status(200).json({
  //       success: true,
  //       message: "Contributors added successfully",
  //       data: project,
  //       statusCode: 200,
  //     });
  //   } catch (error: any) {
  //     console.error("Add contributors error:", error);
  //     res.status(400).json({
  //       success: false,
  //       message: error.message || "Failed to add contributors",
  //       statusCode: 400,
  //     });
  //   }
  // };
}

export default new ProjectController();
