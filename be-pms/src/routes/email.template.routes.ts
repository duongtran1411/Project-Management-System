import { Router } from "express";
import emailTemplateController from "../controllers/email.template.controller";

const router = Router();

/**
 * @openapi
 * /email-template:
 *   post:
 *     summary: Tạo mẫu email mới
 *     tags: [EmailTemplate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, subject, content]
 *             properties:
 *               name: { type: string }
 *               subject: { type: string }
 *               content: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Tạo mẫu email thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", emailTemplateController.create);

/**
 * @openapi
 * /email-template:
 *   get:
 *     summary: Lấy tất cả mẫu email
 *     tags: [EmailTemplate]
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       400:
 *         description: Lỗi lấy dữ liệu
 */
router.get("/", emailTemplateController.getAll);

/**
 * @openapi
 * /email-template/{id}:
 *   get:
 *     summary: Lấy mẫu email theo ID
 *     tags: [EmailTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID mẫu email
 *     responses:
 *       200:
 *         description: Lấy mẫu thành công
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", emailTemplateController.getById);

/**
 * @openapi
 * /email-template/{id}:
 *   put:
 *     summary: Cập nhật mẫu email
 *     tags: [EmailTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID mẫu email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               subject: { type: string }
 *               content: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy mẫu
 */
router.put("/:id", emailTemplateController.update);

/**
 * @openapi
 * /email-template/{id}:
 *   delete:
 *     summary: Xoá mẫu email
 *     tags: [EmailTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID mẫu email cần xoá
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy mẫu
 */
router.delete("/:id", emailTemplateController.delete);

export default router;
