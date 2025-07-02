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
 *       400:
 *         description: Dữ liệu không hợp lệ
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
 * /auth/login-admin:
 *   post:
 *     summary: Đăng nhập admin
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
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: secret
 *     responses:
 *       200:
 *         description: Đăng nhập admin thành công
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 *       403:
 *         description: Không có quyền admin
 */
router.post("/login-admin", authController.loginAdmin);

/**
 * @openapi
 * /auth/check-admin-access:
 *   post:
 *     summary: Đăng nhập Administrator
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
router.post("/check-admin-access", authController.loginAdmin);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu (gửi OTP xác thực)
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
 *         description: OTP đã được gửi về email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @openapi
 * /auth/verify-otp-reset-password:
 *   post:
 *     summary: Xác thực OTP và đặt lại mật khẩu
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset_token_from_forgot_password"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 */
router.post(
  "/verify-otp-reset-password",
  authController.verifyOTPAndResetPassword
);

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
