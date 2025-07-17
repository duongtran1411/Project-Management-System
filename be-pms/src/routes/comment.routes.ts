import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import commentController from "../controllers/comment.controller";

const router = Router()

/**
 * @openapi
 * /comment/{taskId}:
 *   get:
 *     summary: Lấy tất cả mẫu email
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
 *         description: Lấy danh sách thành công
 *       400:
 *         description: Lỗi lấy dữ liệu
 */
router.get('/:taskId',authenticate,commentController.getCommentTask)

/**
 * @openapi
 * /comment:
 *   post:
 *     summary: Tạo mẫu comment mới
 *     tags: [Comment]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               task:
 *                 type: string
 *               author:
 *                 type: string
 *               mentions: 
 *                 type: array
 *                 description: ID của user có trong project
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       description: tên file của image
 *                     url:
 *                       type: string
 *                       description: đường dẫn của image trên cloudinary
 *     responses:
 *       201:
 *         description: Tạo mẫu comment thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

router.post('/', authenticate, commentController.create)


export default router;