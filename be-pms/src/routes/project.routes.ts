
import { Router } from 'express'
import projectController from '../controllers/project.controller';
import { authenticate } from "../middlewares/auth.middleware";
const router = Router();

/**
 * @openapi
 * /project:
 *   post:
 *     summary: Tạo project mới
 *     tags: [Project]
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
 *               icon: { type: string }
 *               projectType: { type: string, enum: [SOFTWARE, MARKETING, SALES] }
 *               defaultAssign: { type: string }
 *               workspaceId: { type: string }
 *               status: { type: string, enum: [TODO, INPROGRESS, COMPLETE] }
 *     responses:
 *       201: { description: Tạo project thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.post("/", authenticate, projectController.createProject);

/**
 * @openapi
 * /project:
 *   get:
 *     summary: Lấy danh sách project
 *     tags: [Project]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy danh sách project thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/", authenticate, projectController.getAllProjects);

/**
 * @openapi
 * /project/{id}:
 *   get:
 *     summary: Lấy project theo ID
 *     tags: [Project]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của project
 *     responses:
 *       200: { description: Lấy project thành công }
 *       404: { description: Không tìm thấy project }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/:id", authenticate, projectController.getProjectById);

/**
 * @openapi
 * /project/{id}:
 *   put:
 *     summary: Cập nhật project
 *     tags: [Project]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               icon: { type: string }
 *               projectType: { type: string, enum: [SOFTWARE, MARKETING, SALES] }
 *               defaultAssign: { type: string }
 *               workspaceId: { type: string }
 *               status: { type: string, enum: [TODO, INPROGRESS, COMPLETE] }
 *     responses:
 *       200: { description: Cập nhật project thành công }
 *       404: { description: Không tìm thấy project }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.put("/:id", authenticate, projectController.updateProject);

/**
 * @openapi
 * /project/{id}:
 *   delete:
 *     summary: Xoá project
 *     tags: [Project]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của project
 *     responses:
 *       200: { description: Xoá project thành công }
 *       404: { description: Không tìm thấy project }
 *       401: { description: Không có quyền truy cập }
 */
router.delete("/:id", authenticate, projectController.deleteProject);

export default router;
