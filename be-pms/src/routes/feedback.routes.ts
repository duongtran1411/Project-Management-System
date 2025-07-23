import express from "express";
import feedbackController from "../controllers/feedback.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /feedback:
 *   post:
 *     summary: Tạo feedback mới
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectContributorId, message]
 *             properties:
 *               projectContributorId:
 *                 type: string
 *                 description: ID của project contributor
 *               message:
 *                 type: string
 *                 description: Nội dung feedback
 *               type:
 *                 type: string
 *                 enum: [BUG, FEATURE_REQUEST, COMMENT]
 *                 description: Loại feedback
 *     responses:
 *       201:
 *         description: Tạo feedback thành công
 *       400:
 *         description: Lỗi tạo feedback
 */
router.post("/", feedbackController.createFeedback);

/**
 * @openapi
 * /feedback:
 *   get:
 *     summary: Lấy danh sách feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng feedback mỗi trang
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [BUG, FEATURE_REQUEST, COMMENT]
 *         description: Lọc feedback theo loại
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Lọc feedback theo projectId
 *     responses:
 *       200:
 *         description: Danh sách feedback
 *       400:
 *         description: Lỗi lấy danh sách feedback
 */
router.get("/", feedbackController.getListFeedbacks);

/**
 * @openapi
 * /feedback/{id}:
 *   put:
 *     summary: Cập nhật feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của feedback cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Nội dung mới của feedback
 *               type:
 *                 type: string
 *                 enum: [BUG, FEATURE_REQUEST, COMMENT]
 *                 description: Loại feedback mới
 *     responses:
 *       200:
 *         description: Cập nhật feedback thành công
 *       404:
 *         description: Không tìm thấy feedback
 */
router.put("/:id", feedbackController.updateFeedback);

export default router;
