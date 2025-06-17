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
      res.status(401).json({
        success: false,
        message: error.message || "Đăng nhập thất bại",
      });
    }
  }
}

export default new AuthController();
