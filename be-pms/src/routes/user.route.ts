import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router();

router.post("/", userController.create);
router.get("/", userController.findAll);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);
router.get("/:id", userController.findOne);
router.patch("/:id/status", userController.updateUserStatus);

export default router;
