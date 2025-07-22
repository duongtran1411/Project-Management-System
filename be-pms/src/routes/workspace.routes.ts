import { Router } from "express";
import workspaceController from "../controllers/workspace.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /workspace:
 *   post:
 *     summary: Tạo workspace mới
 *     tags: [Workspace]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Tạo workspace thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.post("/", authenticate, workspaceController.create);

/**
 * @openapi
 * /workspace:
 *   get:
 *     summary: Lấy tất cả workspace
 *     tags: [Workspace]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy danh sách workspace thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/", authenticate, workspaceController.getAll);

/**
 * @openapi
 * /workspace/{id}:
 *   get:
 *     summary: Lấy workspace theo ID
 *     tags: [Workspace]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của workspace
 *     responses:
 *       200: { description: Lấy workspace thành công }
 *       404: { description: Không tìm thấy workspace }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/:id", authenticate, workspaceController.getById);

/**
 * @openapi
 * /workspace/{id}:
 *   put:
 *     summary: Cập nhật workspace
 *     tags: [Workspace]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               projectIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200: { description: Cập nhật workspace thành công }
 *       404: { description: Không tìm thấy workspace }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.put("/:id", authenticate, workspaceController.update);

/**
 * @openapi
 * /workspace/{id}:
 *   delete:
 *     summary: Xóa workspace
 *     tags: [Workspace]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của workspace
 *     responses:
 *       200: { description: Xoá workspace thành công }
 *       404: { description: Không tìm thấy workspace }
 *       401: { description: Không có quyền truy cập }
 */
router.delete("/:id", authenticate, workspaceController.delete);

/**
 * @openapi
 * /workspace/getbyuser:
 *   get:
 *     summary: Lấy workspace theo user Id
 *     tags: [Workspace]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy workspace thành công }
 *       404: { description: Không tìm thấy workspace }
 *       401: { description: Không có quyền truy cập }
 */
router.get('/getbyuser',authenticate,workspaceController.getByUserId)

export default router;
