import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import commentController from "../controllers/comment.controller";
import { uploadFiles } from "../middlewares/upload.middleware";

const router = Router();

/**
 * @openapi
 * /comment/{taskId}:
 *   get:
 *     summary: Lấy tất cả comments của task
 *     tags: [Comment]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *         description: ID của task
 *     responses:
 *       200:
 *         description: Lấy danh sách comments thành công
 *       400:
 *         description: Lỗi lấy dữ liệu
 */
router.get("/:taskId", authenticate, commentController.getCommentTask);

/**
 * @openapi
 * /comment:
 *   post:
 *     summary: Tạo comment với files
 *     tags: [Comment]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung comment
 *               task:
 *                 type: string
 *                 description: ID của task
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách user IDs được mention (có thể gửi array hoặc string JSON)
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files để upload (tối đa 5 file, mỗi file tối đa 10MB)
 *     responses:
 *       201:
 *         description: Tạo comment thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       type: object
 *                       description: Comment đã tạo với đầy đủ thông tin
 *                     attachments:
 *                       type: array
 *                       description: Tất cả attachments
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Tạo comment thất bại
 */
router.post("/", authenticate, uploadFiles, commentController.createComment);

export default router;
