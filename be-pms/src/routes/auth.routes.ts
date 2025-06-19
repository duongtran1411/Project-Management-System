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
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post("/login", authController.login);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu (gửi mật khẩu mới về email)
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
 *     responses:
 *       200:
 *         description: Mật khẩu mới đã được gửi về email
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Đổi mật khẩu
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
 *                 example: "user@example.com"
 *               oldPassword:
 *                 type: string
 *                 example: "oldpass"
 *               newPassword:
 *                 type: string
 *                 example: "newpass123"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.post("/change-password", authController.changePassword);

export default router;
