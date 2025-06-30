
import { Request, Response, NextFunction } from "express";
import projectService from "../services/project.service";
import { AuthRequest } from "../middlewares/auth.middleware";
export class ProjectController {
    

    createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
          statusCode: 401,
        });
      }

      const project = await projectService.createProject(req.body, user);
      res.status(201).json({
        success: true,
        message: "Project created successfully",
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
        message: "Projects fetched successfully",
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
          message: "Project not found",
          statusCode: 404,
        });
      }

      res.status(200).json({
        success: true,
        message: "Project fetched successfully",
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
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
          statusCode: 401,
        });
      }

      const project = await projectService.updateProject(id, req.body, user);

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project not found",
          statusCode: 404,
        });
      }

      res.status(200).json({
        success: true,
        message: "Project updated successfully",
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

  deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await projectService.deleteProject(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Project not found",
          statusCode: 404,
        });
      }

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete project",
        statusCode: 400,
      });
    }
}


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
