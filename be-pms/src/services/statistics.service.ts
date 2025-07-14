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
    console.log(projectId, userId);
    // Get total tasks assigned to or reported by this user in the project
    const totalTasks = await Task.countDocuments({
      projectId: new Types.ObjectId(projectId),
      $or: [{ assignee: userId }, { reporter: userId }],
    });

    // Get task status statistics for this user
    const taskStatusStats = await Task.aggregate([
      {
        $match: {
          projectId: new Types.ObjectId(projectId),
          $or: [{ assignee: userId }, { reporter: userId }],
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
    const epicStats = await Epic.aggregate([
      {
        $match: {
          projectId: new Types.ObjectId(projectId)
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",      // Epic._id
          foreignField: "epic",   // Task.epic
          as: "tasks"
        }
      },
      {
        $project: {
          epic: "$_id",
          epicName: "$name",
          total: { $size: "$tasks" },
          todo: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "TO_DO"] }
              }
            }
          },
          inProgress: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "IN_PROGRESS"] }
              }
            }
          },
          done: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "DONE"] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          epic_id: 1,
          epicName: 1,
          total: 1,
          todo: 1,
          inProgress: 1,
          done: 1,
          todoPercent: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$todo", "$total"] }, 100] }, 2] }
            ]
          },
          inProgressPercent: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$inProgress", "$total"] }, 100] }, 2] }
            ]
          },
          donePercent: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$done", "$total"] }, 100] }, 2] }
            ]
          }
        }
      }
    ]);
    return { epicStats };
  }


  async getContributorTaskStats(projectId: string) {
    // Get all tasks including unassigned
    const totalTasks = await Task.countDocuments({
      projectId: new Types.ObjectId(projectId),
    });

    // Get contributor statistics
    const contributorStats = await Task.aggregate([
      { $match: { projectId: new Types.ObjectId(projectId) } },
      { $group: { _id: "$assignee", count: { $sum: 1 } } },
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
          assignee: "$_id",
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
    }).select("name description status priority assignee");
  }

}

export default new StatisticsService();
