import { NextFunction, Request, Response } from "express";
import projectContributorService from "../services/project.contributor.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ProjectContributorController {
  getContributorById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const contributor = await projectContributorService.getContributorById(
        id
      );

      if (!contributor) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy contributor",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Lấy contributor thành công",
        data: contributor,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get contributor error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy contributor",
        statusCode: 400,
      });
    }
  };

  updateContributor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const contributor = await projectContributorService.updateContributor(
        id,
        req.body
      );

      if (!contributor) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy contributor",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật contributor thành công",
        data: contributor,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update contributor error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi cập nhật contributor",
        statusCode: 400,
      });
    }
  };

  deleteContributor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await projectContributorService.removeContributor(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy contributor",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Xóa contributor thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete contributor error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi xóa contributor",
        statusCode: 400,
      });
    }
  };

  getContributorsByProject = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const contributors =
        await projectContributorService.getContributorsByProjectId(projectId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách contributor thành công",
        data: contributors,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get contributors by project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy danh sách contributor",
        statusCode: 400,
      });
    }
  };

  getProjectsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const projects = await projectContributorService.getProjectsByUserId(
        userId
      );

      res.status(200).json({
        success: true,
        message: "Projects by user fetched successfully",
        data: projects,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get projects by user error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get projects by user",
        statusCode: 400,
      });
    }
  };

  sendProjectInvitation = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { email, projectId, projectRoleId } = req.body;
      const invitedBy = req.user?._id; // Lấy từ middleware auth

      if (!email || !projectId || !projectRoleId) {
        res.status(400).json({
          success: false,
          message: "Email, projectId và projectRoleId là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      // Đã có middleware authenticate nên không cần kiểm tra invitedBy

      const result = await projectContributorService.sendProjectInvitation(
        email,
        projectId,
        projectRoleId,
        invitedBy
      );

      res.status(201).json({
        success: true,
        message: "Gửi lời mời thành công",
        data: result,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Send project invitation error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi gửi lời mời",
        statusCode: 400,
      });
    }
  };

  sendMultipleProjectInvitations = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { emails, projectId, projectRoleId } = req.body;
      const invitedBy = req.user?._id;

      if (!emails || !Array.isArray(emails) || !projectId || !projectRoleId) {
        res.status(400).json({
          success: false,
          message: "Emails (array), projectId và projectRoleId là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      // Đã có middleware authenticate nên không cần kiểm tra invitedBy

      const result =
        await projectContributorService.sendMultipleProjectInvitations(
          emails,
          projectId,
          projectRoleId,
          invitedBy
        );

      if (result.success.length === 0) {
        res.status(400).json({
          success: false,
          message: "Không có lời mời nào được gửi thành công",
          data: result,
          statusCode: 400,
        });
      } else {
        res.status(201).json({
          success: true,
          message: "Gửi lời mời thành công",
          data: result,
          statusCode: 201,
        });
      }
    } catch (error: any) {
      console.error("Send multiple project invitations error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi gửi lời mời",
        statusCode: 400,
      });
    }
  };

  confirmProjectInvitation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          success: false,
          message: "Token là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const contributor =
        await projectContributorService.confirmProjectInvitation(token);

      res.status(200).json({
        success: true,
        message: "Xác nhận tham gia dự án thành công",
        data: contributor,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Confirm project invitation error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi xác nhận lời mời",
        statusCode: 400,
      });
    }
  };

  getRoleByProjectId = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const user = req.user;
      const role =
        await projectContributorService.getRoleContributorByProjectId(
          user,
          projectId
        );
      if (!role) {
        res.status(400).json({
          success: false,
          message: "Không thể lấy role theo projectId",
          status: 400,
        });
      }

      res.status(200).json({
        status: 200,
        message: "Lấy role project thành công",
        success: true,
        data: {
          role: role,
          user: user,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Không thể lấy role theo projectId",
        statusCode: 400,
      });
    }
  };

  updateProjectLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { currentLeadId, newLeadId } = req.body;
      if (!projectId || !currentLeadId || !newLeadId) {
        res.status(400).json({
          success: false,
          message: "projectId, currentLeadId, newLeadId là bắt buộc",
          statusCode: 400,
        });
        return;
      }
      const result = await projectContributorService.updateProjectLead(
        projectId,
        currentLeadId,
        newLeadId
      );
      res.status(200).json({
        success: true,
        message: "Cập nhật project lead thành công",
        data: result,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi cập nhật project lead",
        statusCode: 400,
      });
    }
  };

  // Lấy thống kê tổng quan về project
  getProjectStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "ProjectId là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const statistics = await projectContributorService.getProjectStatistics(
        projectId
      );

      res.status(200).json({
        success: true,
        message: "Lấy thống kê project thành công",
        data: statistics,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get project statistics error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy thống kê project",
        statusCode: 400,
      });
    }
  };

  getContributorByUserId = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user
      const {projectId} = req.params
      const contributor = await projectContributorService.getContributorByUser(user,projectId)
      if(!contributor){
        res.status(400).json({
          status: 400,
          message: 'Can not get contributor',
          success: false
        })
      }

      res.status(200).json({
        status:200,
        success: true,
        message: 'Lấy contributor thành công',
        data: contributor
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy thống kê project",
        statusCode: 400,
      });
    }
  }
}

export default new ProjectContributorController();
