import express from "express";
import projectContributorController from "../controllers/project.contributor.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /project-contributor/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách contributors theo project
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
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
 * /project-contributor/invitation:
 *   post:
 *     summary: Gửi lời mời tham gia project
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, projectId, projectRoleId]
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *               projectId:
 *                 type: string
 *                 description: ID của project
 *               projectRoleId:
 *                 type: string
 *                 description: ID của role trong project
 *     responses:
 *       201:
 *         description: Gửi lời mời thành công
 *       400:
 *         description: Lỗi gửi lời mời
 */
router.post("/invitation", projectContributorController.sendProjectInvitation);

/**
 * @openapi
 * /project-contributor/invitation/multiple:
 *   post:
 *     summary: Gửi nhiều lời mời cùng lúc
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emails, projectId, projectRoleId]
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách email của người dùng
 *               projectId:
 *                 type: string
 *                 description: ID của project
 *               projectRoleId:
 *                 type: string
 *                 description: ID của role trong project
 *     responses:
 *       201:
 *         description: Gửi lời mời thành công
 *       400:
 *         description: Lỗi gửi lời mời
 */
router.post(
  "/invitation/multiple",
  projectContributorController.sendMultipleProjectInvitations
);

/**
 * @openapi
 * /project-contributor/invitation/confirm/{token}:
 *   post:
 *     summary: Xác nhận lời mời tham gia project
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token xác nhận lời mời
 *     responses:
 *       200:
 *         description: Xác nhận thành công
 *       400:
 *         description: Lỗi xác nhận lời mời
 */
router.post(
  "/invitation/confirm/:token",
  authenticate,
  projectContributorController.confirmProjectInvitation
);

/**
 * @openapi
 * /project-contributor/{id}:
 *   get:
 *     summary: Lấy contributor theo ID
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 * /project-contributor/project/{projectId}/member/{userId}:
 *   delete:
 *     summary: Xóa member khỏi project với cleanup đầy đủ
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần xóa
 *     responses:
 *       200:
 *         description: Xóa member thành công và đã dọn dẹp dữ liệu liên quan
 *       403:
 *         description: Không có quyền xóa member
 *       404:
 *         description: Project hoặc contributor không tồn tại
 */
router.delete(
  "/project/:projectId/member/:userId",
  authenticate,
  projectContributorController.removeMemberFromProject
);

/**
 * @openapi
 * /project-contributor/project/{projectId}/users:
 *   get:
 *     summary: Lấy danh sách tất cả users thuộc project (bao gồm tất cả roles)
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     responses:
 *       200:
 *         description: Danh sách tất cả users trong project
 *       400:
 *         description: Lỗi không lấy được danh sách users
 */
router.get(
  "/project/:projectId/users",
  authenticate,
  projectContributorController.getAllUsersByProjectId
);

/**
 * @openapi
 * /project-contributor/user/{userId}/projects:
 *   get:
 *     summary: Lấy danh sách project theo userId
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
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

/**
 * @openapi
 * /project-contributor/project/role/{projectId}:
 *   get:
 *     summary: Lấy role project theo projectId
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     responses:
 *       200:
 *         description: role project của user
 *       400:
 *         description: Lỗi không lấy được role project
 */
router.get(
  "/project/role/:projectId",
  authenticate,
  projectContributorController.getRoleByProjectId
);

/**
 * @openapi
 * /project-contributor/project/{projectId}/statistics:
 *   get:
 *     summary: Lấy thống kê tổng quan về project
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     responses:
 *       200:
 *         description: Thống kê tổng quan của project
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
 *                     totalUsers:
 *                       type: number
 *                       description: Tổng số người dùng trong project
 *                     adminCount:
 *                       type: number
 *                       description: Số quản trị viên (PROJECT_ADMIN)
 *                     activeUsers:
 *                       type: number
 *                       description: Số người dùng đang hoạt động (có lastLogin trong 30 ngày)
 *                     projectName:
 *                       type: string
 *                       description: Tên project
 *       400:
 *         description: Lỗi không lấy được thống kê project
 */
router.get(
  "/project/:projectId/statistics",
  projectContributorController.getProjectStatistics
);

/**
 * @openapi
 * /project-contributor/project/{projectId}/update-lead:
 *   put:
 *     summary: Chuyển quyền PROJECT_ADMIN cho contributor khác
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentLeadId, newLeadId]
 *             properties:
 *               currentLeadId:
 *                 type: string
 *                 description: ID của user hiện tại là PROJECT_ADMIN
 *               newLeadId:
 *                 type: string
 *                 description: ID của user sẽ được chuyển thành PROJECT_ADMIN
 *     responses:
 *       200:
 *         description: Cập nhật project lead thành công
 *       400:
 *         description: Lỗi cập nhật project lead
 */
router.put(
  "/project/:projectId/update-lead",
  projectContributorController.updateProjectLead
);

/**
 * @openapi
 * /project-contributor/getcontributor/{projectId}:
 *   get:
 *     summary: Lấy contributor theo projectId
 *     tags: [Project Contributor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của project
 *     responses:
 *       200:
 *         description: contributor project của user
 *       400:
 *         description: Lỗi không lấy được contributor project
 */
router.get(
  "/getcontributor/:projectId",
  authenticate,
  projectContributorController.getContributorByUserId
);

export default router;
