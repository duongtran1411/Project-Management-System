import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import epicService from "../services/epic.service";

export class EpicController {
  createEpic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const epicData = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

      const epic = await epicService.createEpic(epicData, user);

      res.status(201).json({
        success: true,
        message: "Tạo epic thành công",
        data: epic,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Create epic error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Tạo epic thất bại",
        statusCode: 400,
      });
    }
  };

  getAllEpics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, status, assignee } = req.query;
      const filters: any = {};

      if (status) filters.status = status;
      if (assignee) filters.assignee = assignee;

      const epics = await epicService.getAllEpics(
        projectId as string,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách epic thành công",
        data: epics,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get all epics error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách epic thất bại",
        statusCode: 400,
      });
    }
  };

  getEpicById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const epic = await epicService.getEpicById(id);

      if (!epic) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy epic",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Lấy thông tin epic thành công",
        data: epic,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get epic by id error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy thông tin epic thất bại",
        statusCode: 400,
      });
    }
  };

  updateEpic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

      const epic = await epicService.updateEpic(id, updateData, user);

      if (!epic) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy epic",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật epic thành công",
        data: epic,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update epic error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật epic thất bại",
        statusCode: 400,
      });
    }
  };

  deleteEpic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await epicService.deleteEpic(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy epic",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Xóa epic thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete epic error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Xóa epic thất bại",
        statusCode: 400,
      });
    }
  };

  getEpicsByProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const epics = await epicService.getEpicsByProject(projectId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách epic theo dự án thành công",
        data: epics,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get epics by project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách epic theo dự án thất bại",
        statusCode: 400,
      });
    }
  };

  getEpicsByAssignee = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assigneeId } = req.params;
      const epics = await epicService.getEpicsByAssignee(assigneeId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách epic theo người được giao thành công",
        data: epics,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get epics by assignee error:", error);
      res.status(400).json({
        success: false,
        message:
          error.message || "Lấy danh sách epic theo người được giao thất bại",
        statusCode: 400,
      });
    }
  };
}

export default new EpicController();
