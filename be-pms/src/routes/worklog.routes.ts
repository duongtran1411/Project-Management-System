import express from "express";
import worklogController from "../controllers/worklog.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /worklog:
 *   post:
 *     summary: Tạo worklog mới
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, timeSpent, timeRemain, startDate, taskId]
 *             properties:
 *               contributor:
 *                 type: string
 *                 description: ID của contributor
 *               taskId:
 *                 type: string
 *                 description: ID của task
 *               description:
 *                 type: string
 *                 description: Mô tả công việc
 *               timeSpent:
 *                 type: number
 *                 description: Thời gian đã sử dụng (phút)
 *               timeRemain:
 *                 type: number
 *                 description: Thời gian còn lại (phút)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Ngày bắt đầu
 *     responses:
 *       201:
 *         description: Tạo worklog thành công
 *       400:
 *         description: Lỗi tạo worklog
 */
router.post("/", worklogController.createWorklog);

/**
 * @openapi
 * /worklog:
 *   get:
 *     summary: Lấy danh sách tất cả worklog
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách worklog
 *       400:
 *         description: Lỗi không lấy được danh sách worklog
 */
router.get("/", worklogController.getAllWorklogs);

/**
 * @openapi
 * /worklog/task/{taskId}:
 *   get:
 *     summary: Lấy danh sách worklog theo taskId
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của task
 *     responses:
 *       200:
 *         description: Danh sách worklog theo task
 *       400:
 *         description: Lỗi không lấy được danh sách worklog
 */
router.get("/task/:taskId", worklogController.getWorklogsByTaskId);

/**
 * @openapi
 * /worklog/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách worklog theo projectId
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     responses:
 *       200:
 *         description: Danh sách worklog theo project
 *       400:
 *         description: Lỗi không lấy được danh sách worklog
 */
router.get("/project/:projectId", worklogController.getWorklogsByProjectId);

/**
 * @openapi
 * /worklog/contributor/{contributorId}:
 *   get:
 *     summary: Lấy danh sách worklog theo contributorId
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contributorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của contributor
 *     responses:
 *       200:
 *         description: Danh sách worklog theo contributor
 *       400:
 *         description: Lỗi không lấy được danh sách worklog
 */
router.get(
  "/contributor/:contributorId",
  worklogController.getWorklogsByContributor
);

/**
 * @openapi
 * /worklog/{id}:
 *   get:
 *     summary: Lấy worklog theo ID
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của worklog
 *     responses:
 *       200:
 *         description: Lấy worklog thành công
 *       404:
 *         description: Không tìm thấy worklog
 */
router.get("/:id", worklogController.getWorklogById);

/**
 * @openapi
 * /worklog/{id}:
 *   put:
 *     summary: Cập nhật worklog
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của worklog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contributor:
 *                 type: string
 *                 description: ID của contributor
 *               taskId:
 *                 type: string
 *                 description: ID của task
 *               description:
 *                 type: string
 *                 description: Mô tả công việc
 *               timeSpent:
 *                 type: number
 *                 description: Thời gian đã sử dụng (phút)
 *               timeRemain:
 *                 type: number
 *                 description: Thời gian còn lại (phút)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Ngày bắt đầu
 *     responses:
 *       200:
 *         description: Cập nhật worklog thành công
 *       404:
 *         description: Worklog không tồn tại
 */
router.put("/:id", worklogController.updateWorklog);

/**
 * @openapi
 * /worklog/{id}:
 *   delete:
 *     summary: Xoá worklog
 *     tags: [Worklog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của worklog
 *     responses:
 *       200:
 *         description: Worklog xoá thành công
 *       404:
 *         description: Worklog không tồn tại
 */
router.delete("/:id", worklogController.deleteWorklog);

export default router;
