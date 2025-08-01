import { Router } from "express";
import milestoneController from "../controllers/milestone.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /milestone:
 *   post:
 *     summary: Tạo milestone mới
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, projectId]
 *             properties:
 *               name: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               goal: { type: string }
 *               projectId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       201: { description: Tạo milestone thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Không có quyền truy cập }
 */
router.post("/", authenticate, milestoneController.createMilestone);

/**
 * @openapi
 * /milestone:
 *   get:
 *     summary: Lấy danh sách milestone
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Lấy danh sách milestone thành công }
 */
router.get("/", authenticate, milestoneController.getAllMilestones);

/**
 * @openapi
 * /milestone/{id}:
 *   get:
 *     summary: Lấy thông tin milestone theo ID
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     responses:
 *       200: { description: Lấy thông tin milestone thành công }
 *       404: { description: Không tìm thấy milestone }
 */
router.get("/:id", authenticate, milestoneController.getMilestoneById);

/**
 * @openapi
 * /milestone/{id}:
 *   put:
 *     summary: Cập nhật milestone
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               goal: { type: string }
 *               projectId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200: { description: Cập nhật milestone thành công }
 *       404: { description: Không tìm thấy milestone }
 *       401: { description: Không có quyền truy cập }
 */
router.put("/:id", authenticate, milestoneController.updateMilestone);

/**
 * @openapi
 * /milestone/{id}:
 *   delete:
 *     summary: Xóa milestone
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     responses:
 *       200: { description: Xóa milestone thành công }
 *       404: { description: Không tìm thấy milestone }
 */
router.delete("/:id", authenticate, milestoneController.deleteMilestone);

/**
 * @openapi
 * /milestone/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách milestone theo dự án
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     responses:
 *       200: { description: Lấy danh sách milestone theo dự án thành công }
 */
router.get("/project/:projectId", authenticate, milestoneController.getMilestonesByProject);

/**
 * @openapi
 * /milestone/date-range:
 *   get:
 *     summary: Lấy danh sách milestone theo khoảng thời gian
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: projectId
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     responses:
 *       200: { description: Lấy danh sách milestone theo khoảng thời gian thành công }
 */
router.get("/date-range", authenticate, milestoneController.getMilestonesByDateRange);

/**
 * @openapi
 * /milestone/upcoming:
 *   get:
 *     summary: Lấy danh sách milestone sắp tới
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Lấy danh sách milestone sắp tới thành công }
 */
router.get("/upcoming", authenticate, milestoneController.getUpcomingMilestones);

/**
 * @openapi
 * /milestone/overdue:
 *   get:
 *     summary: Lấy danh sách milestone quá hạn
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     responses:
 *       200: { description: Lấy danh sách milestone quá hạn thành công }
 */
router.get("/overdue", authenticate, milestoneController.getOverdueMilestones);

/**
 * @openapi
 * /milestone/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái của milestones
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: id của milestones
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200: { description: cập nhật trạng thái milestone thành công }
 *       400: { description: cập nhật trạng thái milestone không thành công}
 */
router.patch('/:id/status', authenticate, milestoneController.updateStatus)


/**
 * @openapi
 * /milestone/active/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách milestone active theo dự án
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     responses:
 *       200: { description: Lấy danh sách milestone với status active theo dự án thành công }
 */
router.get("/active/project/:projectId", authenticate, milestoneController.getMilestonesActiveByProject);

/**
 * @openapi
 * /milestone/notstart/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách milestone notstart theo dự án
 *     tags: [Milestone]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, example: "60d21b4667d0d8992e610c85" }
 *     responses:
 *       200: { description: Lấy danh sách milestone với status not start theo dự án thành công }
 */
router.get("/notstart/project/:projectId", authenticate, milestoneController.getMilestonesNotStartByProject);
export default router;
