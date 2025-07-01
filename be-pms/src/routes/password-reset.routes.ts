import { Router } from "express";
import passwordResetController from "../controllers/password-reset.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Tất cả routes này cần authentication
router.use(authenticate);

/**
 * @openapi
 * /password-reset/stats:
 *   get:
 *     summary: Lấy thống kê password reset
 *     tags:
 *       - Password Reset Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê password reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     expired:
 *                       type: number
 *                     used:
 *                       type: number
 */
router.get("/stats", passwordResetController.getStats);

/**
 * @openapi
 * /password-reset/cleanup:
 *   post:
 *     summary: Dọn dẹp các token hết hạn
 *     tags:
 *       - Password Reset Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã dọn dẹp thành công
 */
router.post("/cleanup", passwordResetController.cleanupExpiredTokens);

export default router;
