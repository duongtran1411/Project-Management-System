import { Router } from "express";
import taskController from "../controllers/task.controller";
import {
  authenticate,
  authorizeProjectRole,
} from "../middlewares/auth.middleware";

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
 *               epic:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               milestones:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               assignee:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               reporter:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               projectId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
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
 *     security: [bearerAuth: []]
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
 *       401: { description: Không có quyền truy cập }
 */
router.get("/", authenticate, taskController.getAllTasks);

/**
 * @openapi
 * /task/{id}:
 *   get:
 *     summary: Lấy thông tin task theo ID
 *     tags: [Task]
 *     security: [bearerAuth: []]
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
 *       401: { description: Không có quyền truy cập }
 */
router.get("/:id", authenticate, taskController.getTaskById);

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
 *               epic:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               milestones:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               assignee:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               reporter:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               projectId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
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
router.put(
  "/:id",
  authenticate,
  authorizeProjectRole("PROJECT_ADMIN"),
  taskController.updateTask
);

/**
 * @openapi
 * /task/bulk-delete:
 *   delete:
 *     summary: Xóa nhiều task cùng lúc
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskIds]
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID của các task cần xóa
 *                 example: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *     responses:
 *       200:
 *         description: Xóa task thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     success: { type: number }
 *                     failed: { type: number }
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.delete("/bulk-delete", authenticate, taskController.deleteManyTasks);

/**
 * @openapi
 * /task/{id}:
 *   delete:
 *     summary: Xóa task
 *     tags: [Task]
 *     security: [bearerAuth: []]
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
 *       401: { description: Không có quyền truy cập }
 */
router.delete("/:id", authenticate, taskController.deleteTask);

/**
 * @openapi
 * /task/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách task theo dự án
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy danh sách task theo dự án thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/project/:projectId",
  authenticate,
  taskController.getTasksByProject
);

/**
 * @openapi
 * /task/epic/{epicId}:
 *   get:
 *     summary: Lấy danh sách task theo epic
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: epicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của epic
 *     responses:
 *       200: { description: Lấy danh sách task theo epic thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/epic/:epicId", authenticate, taskController.getTasksByEpic);

/**
 * @openapi
 * /task/assignee/{assignee}:
 *   get:
 *     summary: Lấy danh sách task theo người được giao
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: assignee
 *         required: true
 *         schema: { type: string }
 *         description: ID của người được giao
 *     responses:
 *       200: { description: Lấy danh sách task theo người được giao thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/assignee/:assignee",
  authenticate,
  taskController.getTasksByAssignee
);

/**
 * @openapi
 * /task/milestone/{milestoneId}:
 *   get:
 *     summary: Lấy danh sách task theo milestone
 *     tags: [Task]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema: { type: string }
 *         description: ID của milestone
 *     responses:
 *       200: { description: Lấy danh sách task theo milestone thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/milestone/:milestoneId",
  authenticate,
  taskController.getTasksByMilestone
);

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
router.patch(
  "/:id/priority",
  authenticate,
  taskController.updateTaskPriority
);

/**
 * @openapi
 * /task/{id}/name:
 *   patch:
 *     summary: Cập nhật tên task
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
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Cập nhật tên task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/name",
  authenticate,
  taskController.updateTaskName
);

/**
 * @openapi
 * /task/{id}/description:
 *   patch:
 *     summary: Cập nhật mô tả task
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
 *             required: [description]
 *             properties:
 *               description: { type: string }
 *     responses:
 *       200: { description: Cập nhật mô tả task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/description",
  authenticate,
  taskController.updateTaskDescription
);

/**
 * @openapi
 * /task/{id}/assignee:
 *   patch:
 *     summary: Cập nhật người được giao task
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
 *               assignee:
 *                 type: string
 *                 nullable: true
 *                 description: ID của người được giao task. Gửi null để hủy giao task
 *     responses:
 *       200: { description: Cập nhật người được giao task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/assignee",
  authenticate,
  taskController.updateTaskAssignee
);

/**
 * @openapi
 * /task/{id}/reporter:
 *   patch:
 *     summary: Cập nhật người báo cáo task
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
 *             required: [reporter]
 *             properties:
 *               reporter: { type: string }
 *     responses:
 *       200: { description: Cập nhật người báo cáo task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/reporter",
  authenticate,
  taskController.updateTaskReporter
);

/**
 * @openapi
 * /task/{id}/epic:
 *   patch:
 *     summary: Cập nhật epic của task
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
 *             required: [epic]
 *             properties:
 *               epic: { type: string }
 *     responses:
 *       200: { description: Cập nhật epic task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/epic",
  authenticate,
  taskController.updateTaskEpic
);

/**
 * @openapi
 * /task/{id}/milestone:
 *   patch:
 *     summary: Cập nhật milestone của task
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
 *             required: [milestone]
 *             properties:
 *               milestone: { type: string }
 *     responses:
 *       200: { description: Cập nhật milestone task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/milestone",
  authenticate,
  taskController.updateTaskMilestone
);

/**
 * @openapi
 * /task/{id}/dates:
 *   patch:
 *     summary: Cập nhật ngày tháng của task
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
 *               startDate: { type: string, format: date }
 *               dueDate: { type: string, format: date }
 *     responses:
 *       200: { description: Cập nhật ngày tháng task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/dates",
  authenticate,
  taskController.updateTaskDates
);

/**
 * @openapi
 * /task/{id}/labels:
 *   patch:
 *     summary: Cập nhật labels của task
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
 *             required: [labels]
 *             properties:
 *               labels:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200: { description: Cập nhật labels task thành công }
 *       404: { description: Không tìm thấy task }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.patch(
  "/:id/labels",
  authenticate,
  taskController.updateTaskLabels
);

export default router;
