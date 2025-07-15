import { Router } from "express";
import emailTemplateController from "../controllers/email.template.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /emailTemplate:
 *   post:
 *     summary: Tạo mẫu email mới
 *     tags: [EmailTemplate]
 *     security: [bearerAuth: []]
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
 *               header: {type: string}
 *               body: {type: string}
 *               footer : {type: string}
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Tạo mẫu email thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", authenticate, emailTemplateController.create);

/**
 * @openapi
 * /emailTemplate:
 *   get:
 *     summary: Lấy tất cả mẫu email
 *     tags: [EmailTemplate]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       400:
 *         description: Lỗi lấy dữ liệu
 */
router.get("/", authenticate, emailTemplateController.getAll);

/**
 * @openapi
 * /emailTemplate/{id}:
 *   get:
 *     summary: Lấy mẫu email theo ID
 *     tags: [EmailTemplate]
 *     security: [bearerAuth: []]
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
router.get("/:id", authenticate, emailTemplateController.getById);

/**
 * @openapi
 * /emailTemplate/{id}:
 *   put:
 *     summary: Cập nhật mẫu email
 *     tags: [EmailTemplate]
 *     security: [bearerAuth: []]
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
router.put("/:id", authenticate, emailTemplateController.update);

/**
 * @openapi
 * /emailTemplate/{id}:
 *   delete:
 *     summary: Xoá mẫu email
 *     tags: [EmailTemplate]
 *     security: [bearerAuth: []]
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
router.delete("/:id", authenticate, emailTemplateController.delete);

export default router;
