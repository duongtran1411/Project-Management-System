import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.route";
import statisticsRoutes from "./statistics.routes";
import emailTemplateRoutes from "./email.template.routes";
import epicRoutes from "./epic.routes";
import taskRoutes from "./task.routes";
import projectRoutes from "./project.routes";
import projectContributorRoutes from "./project.contributor.routes";
import projectRoleRoutes from "./project.role.routes";
import workspaceRotes from "./workspace.routes";
import milestoneRoutes from "./milestone.routes";
import activityLogRoutes from "./activity.log.routes";
import passwordResetRoutes from "./password-reset.routes";
import permissionRoutes from "./permission.routes";
import roleRoutes from "./role.routes";
const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/email-template", emailTemplateRoutes);
router.use("/epic", epicRoutes);
router.use("/task", taskRoutes);
router.use("/permission", permissionRoutes);
router.use("/project", projectRoutes);
router.use("/project-contributor", projectContributorRoutes);
router.use("/project-role", projectRoleRoutes);
router.use("/workspace", workspaceRotes);
router.use("/milestone", milestoneRoutes);
router.use("/activity-log", activityLogRoutes);
router.use("/password-reset", passwordResetRoutes);
router.use("/role", roleRoutes);

export default router;
