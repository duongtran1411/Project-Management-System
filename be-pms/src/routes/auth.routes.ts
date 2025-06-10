import { Router } from "express";
import authController from "../controllers/auth.controller";

const router = Router();

// Public routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res)
);
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
