import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import activityLogService from "../services/activity.log.service";

export class ActivityLogController {
  getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        action,
        entity,
        userId,
        ipAddress,
        country,
        city,
        status,
        requestMethod,
        startDate,
        endDate,
        limit,
        page,
      } = req.query;

      const filters: any = {};
      if (action) filters.action = action;
      if (entity) filters.entity = entity;
      if (userId) filters.userId = userId as string;
      if (ipAddress) filters.ipAddress = ipAddress;
      if (country) filters.country = country;
      if (city) filters.city = city;
      if (status) filters.status = status;
      if (requestMethod) filters.requestMethod = requestMethod;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (page) filters.page = parseInt(page as string);

      const result = await activityLogService.getLogs(filters);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách logs thành công",
        data: result.logs,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get logs error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách logs thất bại",
        statusCode: 400,
      });
    }
  };

  getIpStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await activityLogService.getIpStatistics();

      res.status(200).json({
        success: true,
        message: "Lấy thống kê IP thành công",
        data: stats,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get IP statistics error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy thống kê IP thất bại",
        statusCode: 400,
      });
    }
  };

  getCountryStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await activityLogService.getCountryStatistics();

      res.status(200).json({
        success: true,
        message: "Lấy thống kê quốc gia thành công",
        data: stats,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get country statistics error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy thống kê quốc gia thất bại",
        statusCode: 400,
      });
    }
  };

  getLogsByIp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ipAddress } = req.params;
      const { limit } = req.query;

      const logs = await activityLogService.getLogsByIp(
        ipAddress,
        limit ? parseInt(limit as string) : 100
      );

      res.status(200).json({
        success: true,
        message: "Lấy logs theo IP thành công",
        data: logs,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get logs by IP error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy logs theo IP thất bại",
        statusCode: 400,
      });
    }
  };

  getLogsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const logs = await activityLogService.getLogsByUser(
        userId,
        limit ? parseInt(limit as string) : 100
      );

      res.status(200).json({
        success: true,
        message: "Lấy logs theo user thành công",
        data: logs,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get logs by user error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy logs theo user thất bại",
        statusCode: 400,
      });
    }
  };

  getSuspiciousActivities = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const suspicious = await activityLogService.getSuspiciousActivities();

      res.status(200).json({
        success: true,
        message: "Lấy suspicious activities thành công",
        data: suspicious,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get suspicious activities error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy suspicious activities thất bại",
        statusCode: 400,
      });
    }
  };

  exportLogsToCSV = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        action,
        entity,
        userId,
        ipAddress,
        country,
        city,
        status,
        requestMethod,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};
      if (action) filters.action = action;
      if (entity) filters.entity = entity;
      if (userId) filters.userId = userId as string;
      if (ipAddress) filters.ipAddress = ipAddress;
      if (country) filters.country = country;
      if (city) filters.city = city;
      if (status) filters.status = status;
      if (requestMethod) filters.requestMethod = requestMethod;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const csvData = await activityLogService.exportLogsToCSV(filters);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="activity-logs.csv"'
      );
      res.status(200).send(csvData);
    } catch (error: any) {
      console.error("Export logs error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Export logs thất bại",
        statusCode: 400,
      });
    }
  };

  cleanOldLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { daysOld } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

      const deletedCount = await activityLogService.cleanOldLogs(daysOld || 90);

      res.status(200).json({
        success: true,
        message: `Đã xóa ${deletedCount} logs cũ`,
        data: { deletedCount },
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Clean old logs error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Xóa logs cũ thất bại",
        statusCode: 400,
      });
    }
  };
}

export default new ActivityLogController();
