import { Response } from "express";
import NotificationService from "../services/notification.service";
import { CreateNotificationData } from "../models/notification.model";
import { AuthRequest } from "../middlewares/auth.middleware";

class NotificationController {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        page = 1,
        limit = 20,
        isRead,
        isArchived,
        type,
        entityType,
      } = req.query;
      const query = {
        recipientId: userId,
        page: Number(page),
        limit: Number(limit),
        isRead: isRead !== undefined ? isRead === "true" : undefined,
        isArchived:
          isArchived !== undefined ? isArchived === "true" : undefined,
        type: type as string,
        entityType: entityType as string,
      };
      const result = await NotificationService.getNotifications(query);
      res.status(200).json({
        success: true,
        message: "Lấy danh sách thông báo thành công",
        data: result,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi lấy danh sách thông báo",
        statusCode: 500,
      });
    }
  }

  async getNotificationStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const stats = await NotificationService.getNotificationStats(userId);
      res.status(200).json({
        success: true,
        message: "Lấy thống kê thông báo thành công",
        data: stats,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi lấy thống kê thông báo",
        statusCode: 500,
      });
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;
      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: "Notification ID là bắt buộc",
          statusCode: 400,
        });
        return;
      }
      const notification = await NotificationService.markAsRead(
        notificationId,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Đánh dấu đã đọc thành công",
        data: notification,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi đánh dấu đã đọc",
        statusCode: 500,
      });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const result = await NotificationService.markAllAsRead(userId);
      res.status(200).json({
        success: true,
        message: `Đã đánh dấu ${result.modifiedCount} thông báo là đã đọc`,
        data: result,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi đánh dấu tất cả đã đọc",
        statusCode: 500,
      });
    }
  }

  async archiveNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;
      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: "Notification ID là bắt buộc",
          statusCode: 400,
        });
        return;
      }
      const notification = await NotificationService.archiveNotification(
        notificationId,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Lưu trữ thông báo thành công",
        data: notification,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi lưu trữ thông báo",
        statusCode: 500,
      });
    }
  }

  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;
      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: "Notification ID là bắt buộc",
          statusCode: 400,
        });
        return;
      }
      await NotificationService.deleteNotification(notificationId, userId);
      res.status(200).json({
        success: true,
        message: "Xóa thông báo thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi xóa thông báo",
        statusCode: 500,
      });
    }
  }

  async createNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { recipientId, type, entityType, entityId, metadata } = req.body;
      if (!recipientId || !type || !entityType || !entityId) {
        res.status(400).json({
          success: false,
          message: "recipientId, type, entityType, entityId là bắt buộc",
          statusCode: 400,
        });
        return;
      }
      const notificationData: CreateNotificationData = {
        recipientId,
        senderId: userId,
        type,
        entityType,
        entityId,
        metadata,
      };
      const notification = await NotificationService.createNotification(
        notificationData
      );
      res.status(201).json({
        success: true,
        message: "Tạo thông báo thành công",
        data: notification,
        statusCode: 201,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi tạo thông báo",
        statusCode: 500,
      });
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const stats = await NotificationService.getNotificationStats(userId);
      res.status(200).json({
        success: true,
        message: "Lấy số lượng thông báo chưa đọc thành công",
        data: { unreadCount: stats.unread },
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi lấy số lượng thông báo chưa đọc",
        statusCode: 500,
      });
    }
  }

  async getRecentNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const query = {
        recipientId: userId,
        page: 1,
        limit: 10,
        isRead: false,
        isArchived: false,
      };
      const result = await NotificationService.getNotifications(query);
      res.status(200).json({
        success: true,
        message: "Lấy thông báo mới nhất thành công",
        data: {
          notifications: result.notifications,
          unreadCount: result.total,
        },
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi lấy thông báo mới nhất",
        statusCode: 500,
      });
    }
  }
}

export default new NotificationController();
