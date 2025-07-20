import { Request, Response } from "express";
import worklogService from "../services/worklog.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class WorklogController {
  createWorklog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const createdBy = req.user?._id;
      const worklogData = {
        ...req.body,
        createdBy,
        updatedBy: createdBy,
      };

      const worklog = await worklogService.createWorklog(worklogData);

      res.status(201).json({
        success: true,
        message: "Tạo worklog thành công",
        data: worklog,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Create worklog error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi tạo worklog",
        statusCode: 400,
      });
    }
  };

  getWorklogById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const worklog = await worklogService.getWorklogById(id);

      if (!worklog) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy worklog",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Lấy worklog thành công",
        data: worklog,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get worklog error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy worklog",
        statusCode: 400,
      });
    }
  };

  getAllWorklogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const worklogs = await worklogService.getAllWorklogs();

      res.status(200).json({
        success: true,
        message: "Lấy danh sách worklog thành công",
        data: worklogs,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get all worklogs error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy danh sách worklog",
        statusCode: 400,
      });
    }
  };

  updateWorklog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedBy = req.user?._id;
      const updateData = {
        ...req.body,
        updatedBy,
      };

      const worklog = await worklogService.updateWorklog(id, updateData);

      if (!worklog) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy worklog",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật worklog thành công",
        data: worklog,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update worklog error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi cập nhật worklog",
        statusCode: 400,
      });
    }
  };

  deleteWorklog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await worklogService.deleteWorklog(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy worklog",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Xóa worklog thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete worklog error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi xóa worklog",
        statusCode: 400,
      });
    }
  };

  getWorklogsByTaskId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const worklogs = await worklogService.getWorklogsByTaskId(taskId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách worklog theo task thành công",
        data: worklogs,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get worklogs by task error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy danh sách worklog theo task",
        statusCode: 400,
      });
    }
  };

  getWorklogsByProjectId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const worklogs = await worklogService.getWorklogsByProjectId(projectId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách worklog theo project thành công",
        data: worklogs,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get worklogs by project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy danh sách worklog theo project",
        statusCode: 400,
      });
    }
  };

  getWorklogsByContributor = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { contributorId } = req.params;
      const worklogs = await worklogService.getWorklogsByContributor(
        contributorId
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách worklog theo contributor thành công",
        data: worklogs,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get worklogs by contributor error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy danh sách worklog theo contributor",
        statusCode: 400,
      });
    }
  };
}

export default new WorklogController();
