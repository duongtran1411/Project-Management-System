import { Router } from "express";
import epicController from "../controllers/epic.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /epic:
 *   post:
 *     summary: Tạo epic mới
 *     tags: [Epic]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, projectId, milestonesId, assignee]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               projectId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               milestonesId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               assignee:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               status: { type: string, enum: [TO_DO, IN_PROGRESS, DONE, BLOCKED] }
 *     responses:
 *       201: { description: Tạo epic thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.post("/", authenticate, epicController.createEpic);

/**
 * @openapi
 * /epic:
 *   get:
 *     summary: Lấy danh sách epic
 *     tags: [Epic]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *         description: Lọc theo ID dự án
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [TO_DO, IN_PROGRESS, DONE, BLOCKED] }
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: assignee
 *         schema: { type: string }
 *         description: Lọc theo người được giao
 *     responses:
 *       200: { description: Lấy danh sách epic thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/", epicController.getAllEpics);

/**
 * @openapi
 * /epic/{id}:
 *   get:
 *     summary: Lấy thông tin epic theo ID
 *     tags: [Epic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của epic
 *     responses:
 *       200: { description: Lấy thông tin epic thành công }
 *       404: { description: Không tìm thấy epic }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/:id", epicController.getEpicById);

/**
 * @openapi
 * /epic/{id}:
 *   put:
 *     summary: Cập nhật epic
 *     tags: [Epic]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của epic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               projectId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               milestonesId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               assignee:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               status: { type: string, enum: [TO_DO, IN_PROGRESS, DONE, BLOCKED] }
 *     responses:
 *       200: { description: Cập nhật epic thành công }
 *       404: { description: Không tìm thấy epic }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.put("/:id", authenticate, epicController.updateEpic);

/**
 * @openapi
 * /epic/{id}:
 *   delete:
 *     summary: Xóa epic
 *     tags: [Epic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của epic
 *     responses:
 *       200: { description: Xóa epic thành công }
 *       404: { description: Không tìm thấy epic }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.delete("/:id", epicController.deleteEpic);

/**
 * @openapi
 * /epic/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách epic theo dự án
 *     tags: [Epic]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy danh sách epic theo dự án thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/project/:projectId", epicController.getEpicsByProject);

/**
 * @openapi
 * /epic/assignee/{assigneeId}:
 *   get:
 *     summary: Lấy danh sách epic theo người được giao
 *     tags: [Epic]
 *     parameters:
 *       - in: path
 *         name: assigneeId
 *         required: true
 *         schema: { type: string }
 *         description: ID của người được giao
 *     responses:
 *       200: { description: Lấy danh sách epic theo người được giao thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/assignee/:assigneeId", epicController.getEpicsByAssignee);

export default router;
