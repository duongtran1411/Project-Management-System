import { Request, Response } from "express";
import statisticsService from "../services/statistics.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class StatisticsController {
  async getProjectStatistics(req: Request, res: Response) {
    try {
      const statistics = await statisticsService.getProjectStatistics();
      return res.status(200).json(statistics);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserProjectTaskStats(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;
      const statistics = await statisticsService.getUserProjectTaskStats(
        projectId,
        userId
      );
      return res.status(200).json(statistics);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getTaskPriorityStats(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const statistics = await statisticsService.getTaskPriorityStats(
        projectId
      );
      return res.status(200).json(statistics);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  getEpicTaskStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const statistics = await statisticsService.getEpicTaskStats(projectId);
      if (!statistics) {
        res.status(400).json({
          status: 400,
          success: false,
          message: 'get data failed'
        })
      }
      res.status(200).json({
        status: 200,
        success: true,
        message: 'get data success',
        data: statistics
      });
    } catch (error) {
      res.status(400).json({ message: "Internal server error" });
    }
  }

  async getContributorTaskStats(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const statistics = await statisticsService.getContributorTaskStats(
        projectId
      );
      return res.status(200).json(statistics);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async searchProjects(req: Request, res: Response) {
    try {
      const { searchTerm } = req.query;
      if (!searchTerm || typeof searchTerm !== "string") {
        return res.status(400).json({ message: "Search term is required" });
      }
      const projects = await statisticsService.searchProjects(searchTerm);
      return res.status(200).json(projects);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async searchTasks(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { searchTerm } = req.query;
      if (!searchTerm || typeof searchTerm !== "string") {
        return res.status(400).json({ message: "Search term is required" });
      }
      const tasks = await statisticsService.searchTasks(projectId, searchTerm);
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new StatisticsController();
