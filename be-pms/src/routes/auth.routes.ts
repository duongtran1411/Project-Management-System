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
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: "refresh_token_here"
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh", authController.refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token_id:
 *                 type: string
 *                 example: "token_id_to_revoke"
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Logout failed
 */
router.post("/logout", authController.logout);

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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới (chỉ cần email)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: Mã xác thực đã được gửi đến email
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
 *                     email:
 *                       type: string
 *       400:
 *         description: Email không hợp lệ hoặc đã tồn tại
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /auth/verify-registration-otp:
 *   post:
 *     summary: Xác thực mã OTP đăng ký
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công
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
 *       400:
 *         description: OTP không đúng hoặc đã hết hạn
 */
router.post("/verify-registration-otp", authController.verifyRegistrationOTP);

/**
 * @openapi
 * /auth/setup-account:
 *   post:
 *     summary: Thiết lập tài khoản sau khi xác thực email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - fullName
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: "verification_token_from_email"
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "Password123"
 *     responses:
 *       201:
 *         description: Tài khoản đã được tạo thành công
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
 *                     userId:
 *                       type: string
 *       400:
 *         description: Token không hợp lệ hoặc thông tin không đúng
 */
router.post("/setup-account", authController.setupAccount);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Xác thực email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "verification_token_from_email"
 *     responses:
 *       200:
 *         description: Xác thực email thành công
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
router.post("/verify-email", authController.verifyEmail);

/**
 * @openapi
 * /auth/resend-registration-otp:
 *   post:
 *     summary: Gửi lại mã OTP đăng ký
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Mã OTP đã được gửi lại
 *       400:
 *         description: Email không tồn tại hoặc không có yêu cầu xác thực đang chờ
 */
router.post("/resend-registration-otp", authController.resendVerificationEmail);

export default router;
