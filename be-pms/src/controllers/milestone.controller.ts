import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import milestoneService from "../services/milestone.service";
import { Milestone } from "../models";
import { stat } from "fs";

export class MilestoneController {
  createMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const milestoneData = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

      const milestone = await milestoneService.createMilestone(
        milestoneData,
        user
      );

      res.status(201).json({
        success: true,
        message: "Tạo milestone thành công",
        data: milestone,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Create milestone error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Tạo milestone thất bại",
        statusCode: 400,
      });
    }
  };

  getAllMilestones = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, startDate, endDate } = req.query;
      const filters: any = {};

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const milestones = await milestoneService.getAllMilestones(
        projectId as string,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách milestone thành công",
        data: milestones,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get all milestones error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách milestone thất bại",
        statusCode: 400,
      });
    }
  };

  getMilestoneById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const milestone = await milestoneService.getMilestoneById(id);

      if (!milestone) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy milestone",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Lấy thông tin milestone thành công",
        data: milestone,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get milestone by id error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy thông tin milestone thất bại",
        statusCode: 400,
      });
    }
  };

  updateMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const milestone = await milestoneService.updateMilestone(
        id,
        updateData,
        user
      );

      if (!milestone) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy milestone",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật milestone thành công",
        data: milestone,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update milestone error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật milestone thất bại",
        statusCode: 400,
      });
    }
  };

  deleteMilestone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await milestoneService.deleteMilestone(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy milestone",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Xóa milestone thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete milestone error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Xóa milestone thất bại",
        statusCode: 400,
      });
    }
  };

  getMilestonesByProject = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const milestones = await milestoneService.getMilestonesByProject(
        projectId
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách milestone theo dự án thành công",
        data: milestones,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get milestones by project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách milestone theo dự án thất bại",
        statusCode: 400,
      });
    }
  };

  getMilestonesByDateRange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate, projectId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Start date và end date là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const milestones = await milestoneService.getMilestonesByDateRange(
        new Date(startDate as string),
        new Date(endDate as string),
        projectId as string
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách milestone theo khoảng thời gian thành công",
        data: milestones,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get milestones by date range error:", error);
      res.status(400).json({
        success: false,
        message:
          error.message ||
          "Lấy danh sách milestone theo khoảng thời gian thất bại",
        statusCode: 400,
      });
    }
  };

  getUpcomingMilestones = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId, limit } = req.query;
      const milestones = await milestoneService.getUpcomingMilestones(
        projectId as string,
        limit ? parseInt(limit as string) : 10
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách milestone sắp tới thành công",
        data: milestones,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get upcoming milestones error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách milestone sắp tới thất bại",
        statusCode: 400,
      });
    }
  };

  getOverdueMilestones = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.query;
      const milestones = await milestoneService.getOverdueMilestones(
        projectId as string
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách milestone quá hạn thành công",
        data: milestones,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get overdue milestones error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách milestone quá hạn thất bại",
        statusCode: 400,
      });
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const {status} = req.body
      const user = req.user
      const milestone = await milestoneService.updateStatusMilestones(id, status,user)

      if (!milestone) {
        res.status(400).json({
          status: 400,
          success: true,
          message: `Can not update milestone with id ${id}`
        })
      }

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Update status milestone success',
        data: milestone
      })

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách milestone quá hạn thất bại",
        statusCode: 400,
      });
    }
  }
}

export default new MilestoneController();
