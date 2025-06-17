import { Request, Response } from "express";
import statisticsService from "../services/statistics.service";

export class StatisticsController {
  async getProjectStatistics(req: Request, res: Response) {
    try {
      const stats = await statisticsService.getProjectStatistics();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new StatisticsController();
