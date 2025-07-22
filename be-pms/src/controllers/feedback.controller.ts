import { Request, Response } from "express";
import feedbackService from "../services/feedback.service";

export class FeedbackController {
  // Tạo feedback mới
  createFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const feedback = await feedbackService.createFeedback(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo feedback thành công",
        data: feedback,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Create feedback error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi tạo feedback",
        statusCode: 400,
      });
    }
  };

  // Lấy danh sách feedbacks
  getListFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, type } = req.query;

      const filter: any = {};
      if (type) filter.type = type;

      const result = await feedbackService.getFeedbacks(
        filter,
        Number(page),
        Number(limit)
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách feedback thành công",
        data: result.data,
        total: result.total,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get feedback list error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi lấy danh sách feedback",
        statusCode: 400,
      });
    }
  };

  // Cập nhật feedback
  updateFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const updatedFeedback = await feedbackService.updateFeedback(
        id,
        req.body
      );

      if (!updatedFeedback) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy feedback",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật feedback thành công",
        data: updatedFeedback,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update feedback error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi cập nhật feedback",
        statusCode: 400,
      });
    }
  };
}

export default new FeedbackController();
