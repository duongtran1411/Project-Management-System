import { Router } from "express";
import statisticsController from "../controllers/statistics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /statistics/projects:
 *   get:
 *     summary: Lấy thống kê dự án
 *     tags:
 *       - Statistics
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/projects",
  authenticate,
  authorize("ADMIN"),
  statisticsController.getProjectStatistics
);

export default router;
