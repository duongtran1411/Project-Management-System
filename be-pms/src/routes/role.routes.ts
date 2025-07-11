import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import roleController from "../controllers/role.controller";

const router = Router();

/**
 * @openapi
 * /role:
 *   get:
 *     summary: Lấy danh sách của Role
 *     tags: [Role]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: lấy danh sách role thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.get('/',authenticate,roleController.getAll);

/**
 * @openapi
 * /role/{id}:
 *   get:
 *     summary: Lấy Role theo Id
 *     tags: [Role]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của role
 *     responses:
 *       200: { description: lấy danh sách role thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.get('/:id',authenticate,roleController.getById)

/**
 * @openapi
 * /role:
 *   post:
 *     summary: Tạo role mới
 *     tags: [Role]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: tạo role thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.post('/',authenticate,roleController.create);

/**
 * @openapi
 * /role/{id}:
 *   patch:
 *     summary: Cập nhật permissionIds của Role
 *     tags: [Role]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:  ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *     responses:
 *       200: { description: Cập nhật role thành công }
 *       404: { description: Không tìm thấy role }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch('/:id', authenticate, roleController.updateRole);

export default router;