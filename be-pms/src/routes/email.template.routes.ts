import { Router } from "express";
import emailTemplateController from "../controllers/email.template.controller";

const router = Router();

router.post("/", emailTemplateController.create);
router.get("/", emailTemplateController.getAll);
router.get("/:id", emailTemplateController.getById);
router.put("/:id", emailTemplateController.update);
router.delete("/:id", emailTemplateController.delete);

export default router;
