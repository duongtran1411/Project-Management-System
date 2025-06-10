import { Request, Response } from "express";
import authService from "../services/auth.service";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, roles } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide name, email and password",
        });
      }

      const result = await authService.register({
        name,
        email,
        password,
        roles,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  }

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

  async logout(_req: Request, res: Response) {
    // Since we're using JWT, we don't need to do anything server-side
    // The client should remove the token
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

export default new AuthController();
