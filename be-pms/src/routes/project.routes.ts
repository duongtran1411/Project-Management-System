import { Router } from "express";
import projectController from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, projectController.createProject);
router.get("/", authenticate, projectController.getAllProjects);
router.get("/:id", authenticate, projectController.getProjectById);
router.put("/:id", authenticate, projectController.updateProject);
router.delete("/:id", authenticate, projectController.deleteProject);

export default router;
