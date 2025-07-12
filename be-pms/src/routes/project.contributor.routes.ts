import express from "express";
import projectContributorController from "../controllers/project.contributor.controller";

const router = express.Router();

/**
 * @openapi
 * /project-contributor/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách contributors theo project
 *     tags: [Project Contributor]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     responses:
 *       200:
 *         description: Danh sách contributors
 *       400:
 *         description: Lỗi không lấy được danh sách contributors
 */
router.get(
  "/project/:projectId",
  projectContributorController.getContributorsByProject
);

/**
 * @openapi
 * /project-contributor:
 *   post:
 *     summary: Thêm contributor vào project
 *     tags: [Project Contributor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, projectId, projectRoleId]
 *             properties:
 *               userId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               projectRoleId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo contributor thành công
 *       400:
 *         description: Lỗi tạo contributor
 */
router.post("/", projectContributorController.createContributor);

/**
 * @openapi
 * /project-contributor/{id}:
 *   get:
 *     summary: Lấy contributor theo ID
 *     tags: [Project Contributor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của contributor
 *     responses:
 *       200:
 *         description: Lấy contributor thành công
 *       404:
 *         description: Không tìm thấy contributor
 */
router.get("/:id", projectContributorController.getContributorById);

/**
 * @openapi
 * /project-contributor/{id}:
 *   put:
 *     summary: Cập nhật contributor
 *     tags: [Project Contributor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của contributor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật contributor thành công
 *       404:
 *         description: Contributor không tồn tại
 */
router.put("/:id", projectContributorController.updateContributor);

/**
 * @openapi
 * /project-contributor/{id}:
 *   delete:
 *     summary: Xoá contributor
 *     tags: [Project Contributor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của contributor
 *     responses:
 *       200:
 *         description: Contributor xoá thành công
 *       404:
 *         description: Contributor không tồn tại
 */
router.delete("/:id", projectContributorController.deleteContributor);

/**
 * @openapi
 * /projectContributor/project/{projectId}/users:
 *   get:
 *     summary: Lấy danh sách user thuộc project
 *     tags: [Project Contributor]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     responses:
 *       200:
 *         description: Danh sách user trong project
 *       400:
 *         description: Lỗi không lấy được danh sách user
 */
router.get(
  "/project/:projectId/users",
  projectContributorController.getContributorsByProject
);

/**
 * @openapi
 * /projectContributor/user/{userId}/projects:
 *   get:
 *     summary: Lấy danh sách project theo userId
 *     tags: [Project Contributor]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Danh sách project
 *       400:
 *         description: Lỗi không lấy được project
 */
router.get(
  "/user/:userId/projects",
  projectContributorController.getProjectsByUser
);

export default router;
