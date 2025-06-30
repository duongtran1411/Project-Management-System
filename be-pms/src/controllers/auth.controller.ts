import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import authService from "../services/auth.service";
import activityLogService from "../services/activity.log.service";

export class AuthController {
  googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;
      if (!idToken)
        res.status(400).json({
          success: false,
          message: "Missing idToken",
          statusCode: 400,
        });
      const result = await authService.loginWithGoogle(idToken);
      res.json({
        success: true,
        data: result,
        statusCode: 200,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        success: false,
        message: err.message,
        statusCode: 400,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await authService.loginWithEmail(email, password);

      // Log successful login
      await activityLogService.createLog(
        req,
        "LOGIN",
        "User",
        result.user._id?.toString(),
        result.user._id?.toString(),
        { email, loginMethod: "email" },
        "SUCCESS"
      );

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: result,
        statusCode: 200,
      });
      console.log(result.user);
    } catch (error: any) {
      console.error("Login error:", error);

      // Log failed login
      await activityLogService.createLog(
        req,
        "LOGIN_FAILED",
        "User",
        undefined,
        undefined,
        { email: req.body.email, reason: error.message },
        "FAILED",
        error.message
      );

      const response: any = {
        success: false,
        message: error.message || "Đăng nhập thất bại",
        statusCode: 401,
      };

      if (error.suggestForgotPassword) {
        response.suggestForgotPassword = true;
      }
      res.status(401).json(response);
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Vui lòng nhập email",
          statusCode: 400,
        });
      }
      await authService.forgotPassword(email);
      res.json({
        success: true,
        message: "Mật khẩu mới đã được gửi về email của bạn",
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        statusCode: 400,
      });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, oldPassword, newPassword } = req.body;
      if (!email || !oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Thiếu thông tin đổi mật khẩu",
          statusCode: 400,
        });
      }
      await authService.changePassword(email, oldPassword, newPassword);
      res.json({
        success: true,
        message: "Đổi mật khẩu thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      if (error.message === "Email không tồn tại") {
        res.status(404).json({
          success: false,
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === "Mật khẩu cũ không đúng") {
        res.status(400).json({
          success: false,
          message: error.message,
          statusCode: 400,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || "Đổi mật khẩu thất bại",
        statusCode: 500,
      });
    }
  };
}

export default new AuthController();
