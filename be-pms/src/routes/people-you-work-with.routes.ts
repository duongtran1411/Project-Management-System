import { Router } from "express";
import { PeopleYouWorkWithController } from "../controllers/people-you-work-with.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /people-you-work-with:
 *   get:
 *     summary: Lấy danh sách những người mà user hiện tại đã từng làm việc cùng
 *     tags: [People You Work With]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách người làm việc cùng thành công
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       collaborationType:
 *                         type: string
 *                         enum: [project, task, both]
 *                       lastCollaboration:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Lỗi server khi lấy danh sách người làm việc cùng
 */
router.get("/", PeopleYouWorkWithController.getPeopleYouWorkWith);

/**
 * @openapi
 * /people-you-work-with/stats:
 *   get:
 *     summary: Lấy thống kê về những người làm việc cùng
 *     tags: [People You Work With]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thống kê collaboration thành công
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
 *                     total:
 *                       type: integer
 *                       description: Tổng số người đã làm việc cùng
 *                     projectOnly:
 *                       type: integer
 *                       description: Số người chỉ làm việc cùng trong project
 *                     taskOnly:
 *                       type: integer
 *                       description: Số người chỉ làm việc cùng trong task
 *                     both:
 *                       type: integer
 *                       description: Số người làm việc cùng cả project và task
 *                     recentCollaborations:
 *                       type: integer
 *                       description: Số người có collaboration trong 30 ngày gần đây
 *       500:
 *         description: Lỗi server khi lấy thống kê collaboration
 */
router.get("/stats", PeopleYouWorkWithController.getCollaborationStats);

/**
 * @openapi
 * /people-you-work-with/project/{projectId}:
 *   get:
 *     summary: Lấy danh sách những người đang làm việc cùng trong project hiện tại
 *     tags: [People You Work With]
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
 *         description: Lấy danh sách người làm việc cùng trong project thành công
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Project ID là bắt buộc
 *       500:
 *         description: Lỗi server khi lấy danh sách người làm việc cùng trong project
 */
router.get(
  "/project/:projectId",
  PeopleYouWorkWithController.getCurrentProjectCollaborators
);

export default router;
