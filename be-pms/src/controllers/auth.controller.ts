import { Request, Response } from "express";
import authService from "../services/auth.service";

export class AuthController {
  async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      if (!idToken)
        return res.status(400).json({
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
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập email và mật khẩu",
          statusCode: 400,
        });
      }
      const result = await authService.loginWithEmail(email, password);
      res.status(200).json({
        success: true,
        data: result,
        statusCode: 200,
      });
    } catch (error: any) {
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
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
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
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { email, oldPassword, newPassword } = req.body;
      if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({
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
        return res.status(404).json({
          success: false,
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === "Mật khẩu cũ không đúng") {
        return res.status(400).json({
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
  }
}

export default new AuthController();
