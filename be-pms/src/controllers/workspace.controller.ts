import { Request, Response } from "express";
import workspaceService from "../services/workspace.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class WorkspaceController {
  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const workspace = await workspaceService.createWorkspace(
        req.body,
        req.user
      );
      res.status(201).json({
        success: true,
        message: "Workspace created successfully",
        data: workspace,
        statusCode: 201,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create workspace",
        statusCode: 400,
      });
    }
  };

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const workspaces = await workspaceService.getAllWorkspaces();
      res.status(200).json({
        success: true,
        message: "Workspaces fetched successfully",
        data: workspaces,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch workspaces",
        statusCode: 400,
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const workspace = await workspaceService.getWorkspaceById(req.params.id);
      if (!workspace) {
        res.status(404).json({
          success: false,
          message: "Workspace not found",
          statusCode: 404,
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Workspace fetched successfully",
        data: workspace,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch workspace",
        statusCode: 400,
      });
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const workspace = await workspaceService.updateWorkspace(
        req.params.id,
        req.body,
        req.user
      );
      if (!workspace) {
        res.status(404).json({
          success: false,
          message: "Workspace not found",
          statusCode: 404,
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Workspace updated successfully",
        data: workspace,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update workspace",
        statusCode: 400,
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await workspaceService.deleteWorkspace(req.params.id);
      if (!success) {
        res.status(404).json({
          success: false,
          message: "Workspace not found",
          statusCode: 404,
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Workspace deleted successfully",
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete workspace",
        statusCode: 400,
      });
    }
  };

  getByUserId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(404).json({
          success: false,
          message: "user not found",
          statusCode: 404,
        });
        return;
      }
      const success = await workspaceService.getWorkspaceByUser(user);

      res.status(200).json({
        success: true,
        message: "Get workspace successfully",
        statusCode: 200,
        data: success,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get workspace",
        statusCode: 400,
      });
    }
  };
}

export default new WorkspaceController();
