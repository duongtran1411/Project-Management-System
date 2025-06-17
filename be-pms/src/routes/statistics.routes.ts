import { Router } from "express";
import statisticsController from "../controllers/statistics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// GET /admin/statistics/projects
router.get(
  "/projects",
  authenticate,
  authorize("ADMIN"),
  statisticsController.getProjectStatistics
);

export default router;
