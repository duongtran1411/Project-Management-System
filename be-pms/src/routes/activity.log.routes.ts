import { Router } from "express";
import activityLogController from "../controllers/activity.log.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /activity-log:
 *   get:
 *     summary: Lấy danh sách activity logs
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *       - in: query
 *         name: entity
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: ipAddress
 *         schema: { type: string }
 *       - in: query
 *         name: country
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Lấy danh sách logs thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/", authenticate, activityLogController.getLogs);

/**
 * @openapi
 * /activity-log/ip-statistics:
 *   get:
 *     summary: Lấy thống kê theo IP
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy thống kê IP thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/ip-statistics",
  authenticate,
  activityLogController.getIpStatistics
);

/**
 * @openapi
 * /activity-log/country-statistics:
 *   get:
 *     summary: Lấy thống kê theo quốc gia
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy thống kê quốc gia thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/country-statistics",
  authenticate,
  activityLogController.getCountryStatistics
);

/**
 * @openapi
 * /activity-log/suspicious:
 *   get:
 *     summary: Lấy suspicious activities
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy suspicious activities thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/suspicious",
  authenticate,
  activityLogController.getSuspiciousActivities
);

/**
 * @openapi
 * /activity-log/ip/{ipAddress}:
 *   get:
 *     summary: Lấy logs theo IP
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: ipAddress
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *     responses:
 *       200: { description: Lấy logs theo IP thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/ip/:ipAddress", authenticate, activityLogController.getLogsByIp);

/**
 * @openapi
 * /activity-log/user/{userId}:
 *   get:
 *     summary: Lấy logs theo user
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *     responses:
 *       200: { description: Lấy logs theo user thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/user/:userId", authenticate, activityLogController.getLogsByUser);

/**
 * @openapi
 * /activity-log/export:
 *   get:
 *     summary: Export logs to CSV
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *       - in: query
 *         name: entity
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: ipAddress
 *         schema: { type: string }
 *       - in: query
 *         name: country
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Export logs thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/export", authenticate, activityLogController.exportLogsToCSV);

/**
 * @openapi
 * /activity-log/clean:
 *   post:
 *     summary: Xóa logs cũ
 *     tags: [ActivityLog]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysOld: { type: integer, default: 90 }
 *     responses:
 *       200: { description: Xóa logs cũ thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.post("/clean", authenticate, activityLogController.cleanOldLogs);

export default router;
