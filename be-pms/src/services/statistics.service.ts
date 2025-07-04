import { Project, Task, User, ProjectContributor } from "../models";

export class StatisticsService {
  async getProjectStatistics() {
    // Tổng số project
    const totalProjects = await Project.countDocuments();
    // Tổng số task
    const totalTasks = await Task.countDocuments();
    // Tổng số user
    const totalUsers = await User.countDocuments();

    // Thống kê project theo status
    const projectStatusStats = await Project.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    // Thống kê task theo status
    const taskStatusStats = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    // Tính phần trăm cho project status
    const projectStatusWithPercentage = projectStatusStats.map((stat: any) => ({
      ...stat,
      percentage:
        totalProjects > 0
          ? ((stat.count / totalProjects) * 100).toFixed(2)
          : "0.00",
    }));

    // Tính phần trăm cho task status
    const taskStatusWithPercentage = taskStatusStats.map((stat: any) => ({
      ...stat,
      percentage:
        totalTasks > 0 ? ((stat.count / totalTasks) * 100).toFixed(2) : "0.00",
    }));

    return {
      totalProjects,
      totalTasks,
      totalUsers,
      projectStatusStats: projectStatusWithPercentage,
      taskStatusStats: taskStatusWithPercentage,
    };
  }
}

export default new StatisticsService();
