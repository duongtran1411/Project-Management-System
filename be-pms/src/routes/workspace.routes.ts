import { Router } from "express";
import workspaceController from "../controllers/workspace.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, workspaceController.create);
router.get("/", authenticate, workspaceController.getAll);
router.get("/:id", authenticate, workspaceController.getById);
router.put("/:id", authenticate, workspaceController.update);
router.delete("/:id", authenticate, workspaceController.delete);

export default router;
