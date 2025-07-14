import { Router } from "express";
import projectRoleController from "../controllers/project.role.controller";

const router = Router();

/**
 * @openapi
 * /project-role:
 *   get:
 *     summary: Lấy danh sách tất cả project roles
 *     tags: [ProjectRole]
 *     responses:
 *       200: { description: Lấy danh sách project roles thành công }
 */
router.get("/", projectRoleController.getAllProjectRoles);

/**
 * @openapi
 * /project-role/{id}:
 *   get:
 *     summary: Lấy project role theo ID
 *     tags: [ProjectRole]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của project role
 *     responses:
 *       200: { description: Lấy thông tin project role thành công }
 *       400: { description: ID không hợp lệ }
 *       404: { description: Không tìm thấy project role }
 */
router.get("/:id", projectRoleController.getProjectRoleById);

/**
 * @openapi
 * /project-role:
 *   post:
 *     summary: Tạo project role mới
 *     tags: [ProjectRole]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               projectpermissionIds: { type: array }
 *     responses:
 *       201: { description: Tạo project role thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 */
router.post("/", projectRoleController.createProjectRole);

/**
 * @openapi
 * /project-role/{id}:
 *   put:
 *     summary: Cập nhật project role
 *     tags: [ProjectRole]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của project role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               projectpermissionIds: { type: array }
 *     responses:
 *       200: { description: Cập nhật thành công }
 *       400: { description: ID không hợp lệ }
 *       404: { description: Không tìm thấy project role }
 */
router.put("/:id", projectRoleController.updateProjectRole);

/**
 * @openapi
 * /project-role/{id}:
 *   delete:
 *     summary: Xoá project role
 *     tags: [ProjectRole]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID project role cần xoá
 *     responses:
 *       200: { description: Xoá project role thành công }
 *       400: { description: ID không hợp lệ }
 *       404: { description: Không tìm thấy project role }
 */
router.delete("/:id", projectRoleController.deleteProjectRole);

export default router;
