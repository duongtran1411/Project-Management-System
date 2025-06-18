import { Request, Response } from "express";
import authService from "../services/auth.service";

export class AuthController {
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Please provide refresh token",
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Token refresh failed",
      });
    }
  }

  async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ message: "Missing idToken" });
      const result = await authService.loginWithGoogle(idToken);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập email và mật khẩu",
        });
      }
      const result = await authService.loginWithEmail(email, password);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const response: any = {
        success: false,
        message: error.message || "Đăng nhập thất bại",
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
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng nhập email" });
      }
      await authService.forgotPassword(email);
      res.json({
        success: true,
        message: "Mật khẩu mới đã được gửi về email của bạn",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { email, oldPassword, newPassword } = req.body;
      if (!email || !oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin đổi mật khẩu" });
      }
      await authService.changePassword(email, oldPassword, newPassword);
      res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error: any) {
      if (error.message === "Email không tồn tại") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Mật khẩu cũ không đúng") {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error.message || "Đổi mật khẩu thất bại",
      });
    }
  }
}

export default new AuthController();
