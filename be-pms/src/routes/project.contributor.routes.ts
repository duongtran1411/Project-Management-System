import express from "express";
import projectContributorController from "../controllers/project.contributor.controller";

const router = express.Router();

router.get(
  "/project/:projectId",
  projectContributorController.getContributorsByProject
);
router.post("/", projectContributorController.createContributor);
router.get("/:id", projectContributorController.getContributorById);
router.put("/:id", projectContributorController.updateContributor);
router.delete("/:id", projectContributorController.deleteContributor);

export default router;
