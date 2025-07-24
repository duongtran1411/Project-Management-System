import { Router } from "express";
import { StatisticsController } from "../controllers/statistics.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const statisticsController = new StatisticsController();

/**
 * @openapi
 * /statistics:
 *   get:
 *     summary: Lấy thống kê tổng quan hệ thống
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     responses:
 *       200: { description: Lấy thống kê thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get("/", authenticate, statisticsController.getProjectStatistics);

/**
 * @openapi
 * /statistics/project/{projectId}/tasks:
 *   get:
 *     summary: Lấy thống kê task của user trong dự án
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy thống kê task của user thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/project/:projectId/tasks",
  authenticate,
  statisticsController.getUserProjectTaskStats
);

/**
 * @openapi
 * /statistics/project/{projectId}/all-tasks:
 *   get:
 *     summary: Lấy thống kê tất cả task trong dự án
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy thống kê tất cả task thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/project/:projectId/all-tasks",
  authenticate,
  statisticsController.getProjectTaskStats
);

/**
 * @openapi
 * /statistics/project/{projectId}/priority:
 *   get:
 *     summary: Lấy thống kê task theo độ ưu tiên
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy thống kê độ ưu tiên thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/project/:projectId/priority",
  authenticate,
  statisticsController.getTaskPriorityStats
);

/**
 * @openapi
 * /statistics/project/{projectId}/epics:
 *   get:
 *     summary: Lấy thống kê task theo epic
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy thống kê epic thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/project/:projectId/epics",
  authenticate,
  statisticsController.getEpicTaskStats
);

/**
 * @openapi
 * /statistics/project/{projectId}/contributors:
 *   get:
 *     summary: Lấy thống kê task theo người đóng góp
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *     responses:
 *       200: { description: Lấy thống kê người đóng góp thành công }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/project/:projectId/contributors",
  authenticate,
  statisticsController.getContributorTaskStats
);

/**
 * @openapi
 * /statistics/search/projects:
 *   get:
 *     summary: Tìm kiếm dự án theo tên
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema: { type: string }
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200: { description: Tìm kiếm dự án thành công }
 *       400: { description: Từ khóa tìm kiếm không được để trống }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/search/projects",
  authenticate,
  statisticsController.searchProjects
);

/**
 * @openapi
 * /statistics/project/{projectId}/search/tasks:
 *   get:
 *     summary: Tìm kiếm task theo tên trong dự án
 *     tags: [Statistics]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: ID của dự án
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema: { type: string }
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200: { description: Tìm kiếm task thành công }
 *       400: { description: Từ khóa tìm kiếm không được để trống }
 *       401: { description: Không có quyền truy cập }
 */
router.get(
  "/project/:projectId/search/tasks",
  authenticate,
  statisticsController.searchTasks
);

export default router;
