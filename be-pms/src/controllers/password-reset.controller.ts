import { Request, Response } from "express";
import passwordResetService from "../services/password-reset.service";

export class PasswordResetController {
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await passwordResetService.getResetStats();
      res.json({
        success: true,
        data: stats,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        statusCode: 500,
      });
    }
  };

  cleanupExpiredTokens = async (req: Request, res: Response): Promise<void> => {
    try {
      await passwordResetService.cleanupExpiredTokens();
      res.json({
        success: true,
        message: "Đã dọn dẹp các token hết hạn",
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        statusCode: 500,
      });
    }
  };
}

export default new PasswordResetController();
