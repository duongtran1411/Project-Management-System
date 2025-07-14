import { Request, Response } from "express";
import projectContributorService from "../services/project.contributor.service";

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
          message: "Contributor not found",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Contributor fetched successfully",
        data: contributor,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get contributor error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch contributor",
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
          message: "Contributor not found",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Contributor updated successfully",
        data: contributor,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update contributor error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update contributor",
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
          message: "Contributor not found",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Contributor deleted successfully",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete contributor error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete contributor",
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
        message: "Contributors by project fetched successfully",
        data: contributors,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get contributors by project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get contributors by project",
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

  // Thêm contributor bằng email
  addContributorByEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email, projectId, projectRoleId } = req.body;

      if (!email || !projectId || !projectRoleId) {
        res.status(400).json({
          success: false,
          message: "Email, projectId và projectRoleId là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const contributor = await projectContributorService.addContributorByEmail(
        email,
        projectId,
        projectRoleId
      );

      res.status(201).json({
        success: true,
        message: "Thêm contributor thành công",
        data: contributor,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Add contributor by email error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi thêm contributor",
        statusCode: 400,
      });
    }
  };

  // Thêm nhiều contributors cùng lúc
  addMultipleContributors = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { emails, projectId, projectRoleId } = req.body;

      if (!emails || !Array.isArray(emails) || !projectId || !projectRoleId) {
        res.status(400).json({
          success: false,
          message: "Emails (array), projectId và projectRoleId là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const result = await projectContributorService.addMultipleContributors(
        emails,
        projectId,
        projectRoleId
      );

      res.status(201).json({
        success: true,
        message: "Thêm contributors thành công",
        data: result,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Add multiple contributors error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi thêm contributors",
        statusCode: 400,
      });
    }
  };
}

export default new ProjectContributorController();
