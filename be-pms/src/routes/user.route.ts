import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router();

/**
 * @openapi
 * /user:
 *   post:
 *     summary: Tạo người dùng mới
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               avatar: { type: string }
 *     responses:
 *       201: { description: Tạo người dùng thành công }
 *       400: { description: Lỗi tạo người dùng }
 */
router.post("/", userController.create);

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [User]
 *     responses:
 *       200: { description: Lấy danh sách người dùng thành công }
 *       400: { description: Lỗi khi lấy dữ liệu }
 */
router.get("/", userController.findAll);

/**
 * @openapi
 * /user/{id}:
 *   get:
 *     summary: Lấy người dùng theo ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của người dùng
 *     responses:
 *       200: { description: Lấy thông tin người dùng thành công }
 *       404: { description: Không tìm thấy người dùng }
 */
router.get("/:id", userController.findOne);

/**
 * @openapi
 * /user/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               avatar: { type: string }
 *     responses:
 *       200: { description: Cập nhật thành công }
 *       404: { description: Không tìm thấy người dùng }
 */
router.put("/:id", userController.update);

/**
 * @openapi
 * /user/{id}:
 *   delete:
 *     summary: Xoá người dùng
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID người dùng cần xoá
 *     responses:
 *       200: { description: Xoá người dùng thành công }
 *       404: { description: Không tìm thấy người dùng }
 */
router.delete("/:id", userController.delete);

/**
 * @openapi
 * /user/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái người dùng
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BANNED]
 *     responses:
 *       200: { description: Cập nhật trạng thái thành công }
 *       404: { description: Không tìm thấy người dùng }
 */
router.patch("/:id/status", userController.updateUserStatus);

export default router;
