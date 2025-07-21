import Worklog, { IWorklog } from "../models/worklog.model";
import Task from "../models/task.model";
import Project from "../models/project.model";

export class WorklogService {
  async createWorklog(worklogData: Partial<IWorklog>): Promise<any> {
    const worklog = await Worklog.create(worklogData);
    return worklog.populate([
      { path: "contributor", select: "fullName email avatar" },
      { path: "taskId", select: "title" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
  }

  async getWorklogById(id: string): Promise<any> {
    const worklog = await Worklog.findById(id).populate([
      { path: "contributor", select: "fullName email avatar" },
      { path: "taskId", select: "title" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
    return worklog;
  }

  async getAllWorklogs(): Promise<any[]> {
    const worklogs = await Worklog.find().populate([
      { path: "contributor", select: "fullName email avatar" },
      { path: "taskId", select: "title" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
    return worklogs;
  }

  async updateWorklog(id: string, updateData: Partial<IWorklog>): Promise<any> {
    const worklog = await Worklog.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate([
      { path: "contributor", select: "fullName email avatar" },
      { path: "taskId", select: "title" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
    return worklog;
  }

  async deleteWorklog(id: string): Promise<boolean> {
    const result = await Worklog.findByIdAndDelete(id);
    return !!result;
  }

  async getWorklogsByTaskId(taskId: string): Promise<any[]> {
    const worklogs = await Worklog.find({ taskId }).populate([
      { path: "contributor", select: "fullName email avatar" },
      { path: "taskId", select: "title" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
    return worklogs;
  }

  async getWorklogsByProjectId(projectId: string): Promise<any[]> {
    // First, get all tasks in the project
    const tasks = await Task.find({ projectId }).select("_id");
    const taskIds = tasks.map((task) => task._id);

    // Then get all worklogs for these tasks
    const worklogs = await Worklog.find({ taskId: { $in: taskIds } }).populate([
      { path: "contributor", select: "fullName email avatar" },
      { path: "taskId", select: "title name" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
    return worklogs;
  }

  async getWorklogsByContributor(contributorId: string): Promise<any[]> {
    const worklogs = await Worklog.find({
      contributor: contributorId,
    }).populate([
      { path: "contributor", select: "fullName email avatar" },
      { path: "taskId", select: "title" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
    return worklogs;
  }

  async getWorklogStatisticsByProjectId(projectId: string): Promise<any> {
    const tasks = await Task.find({ projectId }).select("_id");
    const taskIds = tasks.map((task) => task._id);

    const statistics = await Worklog.aggregate([
      {
        $match: {
          taskId: { $in: taskIds },
        },
      },
      {
        $group: {
          _id: null,
          totalSpentTime: { $sum: "$timeSpent" },
          totalRemainTime: { $sum: "$timeRemain" },
          totalTask: { $addToSet: "$taskId" },
          totalContributor: { $addToSet: "$contributor" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSpentTime: 1,
          totalRemainTime: 1,
          totalTask: { $size: "$totalTask" },
          totalContributor: { $size: "$totalContributor" },
        },
      },
    ]);

    return (
      statistics[0] || {
        totalSpentTime: 0,
        totalRemainTime: 0,
        totalTask: 0,
        totalContributor: 0,
      }
    );
  }

  async getTopContributorsByProject(
    projectId: string,
    limit: number = 6
  ): Promise<any[]> {
    const tasks = await Task.find({ projectId }).select("_id");
    const taskIds = tasks.map((task) => task._id);

    const topContributors = await Worklog.aggregate([
      { $match: { taskId: { $in: taskIds } } },
      {
        $group: {
          _id: "$contributor",
          totalSpentTime: { $sum: "$timeSpent" },
          totalRemainTime: { $sum: "$timeRemain" },
          totalTask: { $addToSet: "$taskId" },
        },
      },
      {
        $project: {
          contributor: "$_id",
          totalSpentTime: 1,
          totalRemainTime: 1,
          totalTask: { $size: "$totalTask" },
        },
      },
      { $sort: { totalSpentTime: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "contributor",
          foreignField: "_id",
          as: "contributorInfo",
        },
      },
      { $unwind: "$contributorInfo" },
      {
        $project: {
          contributor: {
            _id: "$contributorInfo._id",
            fullName: "$contributorInfo.fullName",
            email: "$contributorInfo.email",
            avatar: "$contributorInfo.avatar",
          },
          totalSpentTime: 1,
          totalRemainTime: 1,
          totalTask: 1,
        },
      },
    ]);
    return topContributors;
  }
}

export default new WorklogService();
