import { Router } from "express";
import permissionController from "../controllers/permission.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /permission:
 *   get:
 *     summary: Lấy danh sách permission
 *     tags: [Permission]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy danh sách Permission thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get('/',authenticate,permissionController.getAll)


/**
 * @openapi
 * /permission:
 *   post:
 *     summary: Tạo permission cho hệ thống
 *     tags: [Permission]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               code: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Tạo permission thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.post('/',authenticate,permissionController.create)

export default router;