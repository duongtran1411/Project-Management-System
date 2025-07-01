import { Router } from "express";
import statisticsController from "../controllers/statistics.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /statistics:
 *   get:
 *     summary: Lấy thống kê tổng quan hệ thống
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 */
router.get("/", authenticate, statisticsController.getProjectStatistics);
export default router;
