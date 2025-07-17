import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { PeopleYouWorkWithService } from "../services/people-you-work-with.service";

export class PeopleYouWorkWithController {
  /**
   * Lấy danh sách những người mà user hiện tại đã từng làm việc cùng
   */
  static async getPeopleYouWorkWith(req: AuthRequest, res: Response) {
    try {
      const people = await PeopleYouWorkWithService.getPeopleYouWorkWith(req);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách người làm việc cùng thành công",
        data: people,
      });
    } catch (error: any) {
      console.error("Error in getPeopleYouWorkWith controller:", error);
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Có lỗi xảy ra khi lấy danh sách người làm việc cùng",
      });
    }
  }

  /**
   * Lấy danh sách những người đang làm việc cùng trong project hiện tại
   */
  static async getCurrentProjectCollaborators(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project ID là bắt buộc",
        });
      }

      const collaborators =
        await PeopleYouWorkWithService.getCurrentProjectCollaborators(
          req,
          projectId
        );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách người làm việc cùng trong project thành công",
        data: collaborators,
      });
    } catch (error: any) {
      console.error(
        "Error in getCurrentProjectCollaborators controller:",
        error
      );
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Có lỗi xảy ra khi lấy danh sách người làm việc cùng trong project",
      });
    }
  }

  /**
   * Lấy thống kê về những người làm việc cùng
   */
  static async getCollaborationStats(req: AuthRequest, res: Response) {
    try {
      const people = await PeopleYouWorkWithService.getPeopleYouWorkWith(req);

      // Thống kê theo loại collaboration
      const stats = {
        total: people.length,
        projectOnly: people.filter((p) => p.collaborationType === "project")
          .length,
        taskOnly: people.filter((p) => p.collaborationType === "task").length,
        both: people.filter((p) => p.collaborationType === "both").length,
        recentCollaborations: people.filter((p) => {
          if (!p.lastCollaboration) return false;
          const lastCollab = new Date(p.lastCollaboration);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastCollab > thirtyDaysAgo;
        }).length,
      };

      res.status(200).json({
        success: true,
        message: "Lấy thống kê collaboration thành công",
        data: stats,
      });
    } catch (error: any) {
      console.error("Error in getCollaborationStats controller:", error);
      res.status(500).json({
        success: false,
        message:
          error.message || "Có lỗi xảy ra khi lấy thống kê collaboration",
      });
    }
  }
}
