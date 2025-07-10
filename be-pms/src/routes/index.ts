import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.route";
import statisticsRoutes from "./statistics.routes";
import emailTemplateRoutes from "./email.template.routes";
import epicRoutes from "./epic.routes";
import taskRoutes from "./task.routes";
import projectRoutes from "./project.routes";
import projectContributorRoutes from "./project.contributor.routes";
import workspaceRotes from "./workspace.routes";
import milestoneRoutes from "./milestone.routes";
import activityLogRoutes from "./activity.log.routes";
import passwordResetRoutes from "./password-reset.routes";
import permissionRoutes from './permission.routes';
import roleRoutes from './role.routes'
const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/emailTemplate", emailTemplateRoutes);
router.use("/epic", epicRoutes);
router.use("/task", taskRoutes);
router.use('/permission',permissionRoutes)
router.use("/project", projectRoutes);
router.use("/projectContributor", projectContributorRoutes);
router.use("/workspace", workspaceRotes);
router.use("/milestone", milestoneRoutes);
router.use("/activity-log", activityLogRoutes);
router.use("/password-reset", passwordResetRoutes);
router.use('/role',roleRoutes)

// Health check
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
