import { Router } from "express";
import authController from "../controllers/auth.controller";

const router = Router();

/**
 * @openapi
 * /auth/google-login:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: "google_id_token"
 */
router.post("/google-login", authController.googleLogin);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret
 */
router.post("/login", authController.login);

export default router;
