import { Router } from "express";
import taskController from "../controllers/task.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /task:
 *   post:
 *     summary: Tạo task mới
 *     tags: [Task]
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
 *               epic: { type: string }
 *               milestones: { type: string }
 *               assignee: { type: string }
 *               reporter: { type: string }
 *               projectId: { type: string }
 *               startDate: { type: string, format: date }
 *               dueDate: { type: string, format: date }
 *               status: { type: string, enum: [TO_DO, IN_PROGRESS, DONE, BLOCKED] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               labels: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Tạo task thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.post("/", authenticate, taskController.createTask);

/**
 * @openapi
 * /task:
 *   get:
 *     summary: Lấy danh sách task
 *     tags: [Task]
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
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *         description: Lọc theo độ ưu tiên
 *       - in: query
 *         name: assignee
 *         schema: { type: string }
 *         description: Lọc theo người được giao
 *       - in: query
 *         name: epic
 *         schema: { type: string }
 *         description: Lọc theo epic
 *       - in: query
 *         name: milestones
 *         schema: { type: string }
 *         description: Lọc theo milestone
 *     responses:
 *       200: { description: Lấy danh sách task thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/", taskController.getAllTasks);

/**
 * @openapi
 * /task/{id}:
 *   get:
 *     summary: Lấy thông tin task theo ID
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của task
 *     responses:
 *       200: { description: Lấy thông tin task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/:id", taskController.getTaskById);

/**
 * @openapi
 * /task/{id}:
 *   put:
 *     summary: Cập nhật task
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               epic: { type: string }
 *               milestones: { type: string }
 *               assignee: { type: string }
 *               reporter: { type: string }
 *               projectId: { type: string }
 *               startDate: { type: string, format: date }
 *               dueDate: { type: string, format: date }
 *               status: { type: string, enum: [TO_DO, IN_PROGRESS, DONE, BLOCKED] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               labels: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Cập nhật task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.put("/:id", authenticate, taskController.updateTask);

/**
 * @openapi
 * /task/{id}:
 *   delete:
 *     summary: Xóa task
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của task
 *     responses:
 *       200: { description: Xóa task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.delete("/:id", taskController.deleteTask);

/**
 * @openapi
 * /task/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách task theo dự án
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy danh sách task theo dự án thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/project/:projectId", taskController.getTasksByProject);

/**
 * @openapi
 * /task/epic/{epicId}:
 *   get:
 *     summary: Lấy danh sách task theo epic
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: epicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của epic
 *     responses:
 *       200: { description: Lấy danh sách task theo epic thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/epic/:epicId", taskController.getTasksByEpic);

/**
 * @openapi
 * /task/assignee/{assigneeId}:
 *   get:
 *     summary: Lấy danh sách task theo người được giao
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: assigneeId
 *         required: true
 *         schema: { type: string }
 *         description: ID của người được giao
 *     responses:
 *       200: { description: Lấy danh sách task theo người được giao thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/assignee/:assigneeId", taskController.getTasksByAssignee);

/**
 * @openapi
 * /task/milestone/{milestoneId}:
 *   get:
 *     summary: Lấy danh sách task theo milestone
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema: { type: string }
 *         description: ID của milestone
 *     responses:
 *       200: { description: Lấy danh sách task theo milestone thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.get("/milestone/:milestoneId", taskController.getTasksByMilestone);

/**
 * @openapi
 * /task/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái task
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [TO_DO, IN_PROGRESS, DONE, BLOCKED] }
 *     responses:
 *       200: { description: Cập nhật trạng thái task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch("/:id/status", authenticate, taskController.updateTaskStatus);

/**
 * @openapi
 * /task/{id}/priority:
 *   patch:
 *     summary: Cập nhật độ ưu tiên task
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [priority]
 *             properties:
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *     responses:
 *       200: { description: Cập nhật độ ưu tiên task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch("/:id/priority", authenticate, taskController.updateTaskPriority);

export default router;
