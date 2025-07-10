import { Project, Task, User, ProjectContributor, Epic } from "../models";
import { Types } from "mongoose";

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

  async getUserProjectTaskStats(projectId: string, userId: string) {
    // Get total tasks assigned to or reported by this user in the project
    const totalTasks = await Task.countDocuments({
      projectId: new Types.ObjectId(projectId),
      $or: [
        { assigneeId: new Types.ObjectId(userId) },
        { reporterId: new Types.ObjectId(userId) },
      ],
    });

    // Get task status statistics for this user
    const taskStatusStats = await Task.aggregate([
      {
        $match: {
          projectId: new Types.ObjectId(projectId),
          $or: [
            { assigneeId: new Types.ObjectId(userId) },
            { reporterId: new Types.ObjectId(userId) },
          ],
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    // Calculate percentages
    const taskStatusWithPercentage = taskStatusStats.map((stat: any) => ({
      ...stat,
      percentage:
        totalTasks > 0 ? ((stat.count / totalTasks) * 100).toFixed(2) : "0.00",
    }));

    return {
      totalTasks,
      taskStatusStats: taskStatusWithPercentage,
    };
  }

  async getTaskPriorityStats(projectId: string) {
    const totalTasks = await Task.countDocuments({
      projectId: new Types.ObjectId(projectId),
    });

    // Get priority statistics
    const priorityStats = await Task.aggregate([
      { $match: { projectId: new Types.ObjectId(projectId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { priority: "$_id", count: 1, _id: 0 } },
    ]);

    // Calculate percentages
    const priorityWithPercentage = priorityStats.map((stat: any) => ({
      ...stat,
      percentage:
        totalTasks > 0 ? ((stat.count / totalTasks) * 100).toFixed(2) : "0.00",
    }));

    return {
      totalTasks,
      priorityStats: priorityWithPercentage,
    };
  }

  async getEpicTaskStats(projectId: string) {
    // Get all epics in project
    const epics = await Epic.find({ projectId: new Types.ObjectId(projectId) });

    const epicStats = await Promise.all(
      epics.map(async (epic) => {
        const totalEpicTasks = await Task.countDocuments({
          projectId: new Types.ObjectId(projectId),
          epicId: epic._id,
        });

        const taskStatusStats = await Task.aggregate([
          {
            $match: {
              projectId: new Types.ObjectId(projectId),
              epicId: epic._id,
            },
          },
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $project: { status: "$_id", count: 1, _id: 0 } },
        ]);

        const statusWithPercentage = taskStatusStats.map((stat: any) => ({
          ...stat,
          percentage:
            totalEpicTasks > 0
              ? ((stat.count / totalEpicTasks) * 100).toFixed(2)
              : "0.00",
        }));

        return {
          epicId: epic._id,
          epicName: epic.name,
          totalTasks: totalEpicTasks,
          taskStatusStats: statusWithPercentage,
        };
      })
    );

    return epicStats;
  }

  async getContributorTaskStats(projectId: string) {
    // Get all tasks including unassigned
    const totalTasks = await Task.countDocuments({
      projectId: new Types.ObjectId(projectId),
    });

    // Get contributor statistics
    const contributorStats = await Task.aggregate([
      { $match: { projectId: new Types.ObjectId(projectId) } },
      { $group: { _id: "$assigneeId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          assigneeId: "$_id",
          count: 1,
          userName: { $arrayElemAt: ["$user.name", 0] },
          _id: 0,
        },
      },
    ]);

    // Calculate percentages and handle unassigned
    const statsWithPercentage = contributorStats.map((stat: any) => ({
      ...stat,
      userName: stat.userName || "Unassigned",
      percentage:
        totalTasks > 0 ? ((stat.count / totalTasks) * 100).toFixed(2) : "0.00",
    }));

    return {
      totalTasks,
      contributorStats: statsWithPercentage,
    };
  }

  async searchProjects(searchTerm: string) {
    return Project.find({
      name: { $regex: searchTerm, $options: "i" },
    }).select("name description status");
  }

  async searchTasks(projectId: string, searchTerm: string) {
    return Task.find({
      projectId: new Types.ObjectId(projectId),
      name: { $regex: searchTerm, $options: "i" },
    }).select("name description status priority assigneeId");
  }
}

export default new StatisticsService();
