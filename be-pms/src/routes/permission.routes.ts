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

/**
 * @openapi
 * /permission/{id}:
 *   get:
 *     summary: Lấy Permission theo Id
 *     tags: [Permission]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của permission
 *     responses:
 *       200: { description: lấy permission thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.get('/:id',authenticate,permissionController.getById)

/**
 * @openapi
 * /permission/{id}:
 *   put:
 *     summary: Cập nhật Permission
 *     tags: [Permission]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của Permission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example:  "ADMIN_VIEW"
 *               description:
 *                 type: string
 *                 example:  "manage user"
 *     responses:
 *       200: { description: Cập nhật permission thành công }
 *       404: { description: Không tìm thấy permission }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.put('/:id',authenticate, permissionController.update)

export default router;