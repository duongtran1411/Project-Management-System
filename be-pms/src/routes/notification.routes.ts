import express from "express";
import NotificationController from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @openapi
 * /notification:
 *   get:
 *     summary: Lấy danh sách thông báo của user
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/", NotificationController.getNotifications);

/**
 * @openapi
 * /notification/stats:
 *   get:
 *     summary: Lấy thống kê thông báo của user
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/stats", NotificationController.getNotificationStats);

/**
 * @openapi
 * /notification/unread-count:
 *   get:
 *     summary: Lấy số lượng thông báo chưa đọc
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/unread-count", NotificationController.getUnreadCount);

/**
 * @openapi
 * /notification/recent:
 *   get:
 *     summary: Lấy 10 thông báo mới nhất chưa đọc
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/recent", NotificationController.getRecentNotifications);

/**
 * @openapi
 * /notification/{notificationId}/read:
 *   patch:
 *     summary: Đánh dấu 1 thông báo là đã đọc
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch("/:notificationId/read", NotificationController.markAsRead);

/**
 * @openapi
 * /notification/mark-all-read:
 *   patch:
 *     summary: Đánh dấu tất cả thông báo là đã đọc
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch("/mark-all-read", NotificationController.markAllAsRead);

/**
 * @openapi
 * /notification/{notificationId}/archive:
 *   patch:
 *     summary: Lưu trữ 1 thông báo
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lưu trữ thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch(
  "/:notificationId/archive",
  NotificationController.archiveNotification
);

/**
 * @openapi
 * /notification/{notificationId}:
 *   delete:
 *     summary: Xóa 1 thông báo
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.delete("/:notificationId", NotificationController.deleteNotification);

/**
 * @openapi
 * /notification:
 *   post:
 *     summary: Tạo mới 1 thông báo (dùng nội bộ)
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: string
 *               type:
 *                 type: string
 *               entityType:
 *                 type: string
 *               entityId:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.post("/", NotificationController.createNotification);

export default router;
