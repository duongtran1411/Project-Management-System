import Task, { ITask } from "../models/task.model";
import { AuthRequest } from "../middlewares/auth.middleware";

export class TaskService {
  async createTask(taskData: Partial<ITask>, user: any): Promise<ITask> {
    if (!taskData.projectId) {
      throw new Error("Project ID is required");
    }

    const task = await Task.create({
      ...taskData,
      createdBy: user._id,
      updatedBy: user._id,
    });
    return task.populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);
  }

  async getAllTasks(projectId?: string, filters?: any): Promise<ITask[]> {
    const query: any = {};

    if (projectId) {
      query.projectId = projectId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.priority) {
      query.priority = filters.priority;
    }

    if (filters?.assignee) {
      query.assignee = filters.assignee;
    }

    if (filters?.epic) {
      query.epic = filters.epic;
    }

    if (filters?.milestones) {
      query.milestones = filters.milestones;
    }

    const tasks = await Task.find(query)
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "reporter", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
        { path: "epic", select: "name description" },
        { path: "milestones", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return tasks;
  }

  async getTaskById(taskId: string): Promise<ITask | null> {
    const task = await Task.findById(taskId).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);
    return task;
  }

  async updateTask(
    taskId: string,
    updateData: Partial<ITask>,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        ...updateData,
        updatedBy: user._id,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);

    return task;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const result = await Task.findByIdAndDelete(taskId);
    return !!result;
  }

  async getTasksByProject(projectId: string): Promise<ITask[]> {
    const tasks = await Task.find({ projectId })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "reporter", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "epic", select: "name description" },
        { path: "milestones", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return tasks;
  }

  async getTasksByEpic(epicId: string): Promise<ITask[]> {
    const tasks = await Task.find({ epic: epicId })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "reporter", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
        { path: "milestones", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return tasks;
  }

  async getTasksByAssignee(assigneeId: string): Promise<ITask[]> {
    const tasks = await Task.find({ assignee: assigneeId })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "reporter", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
        { path: "epic", select: "name description" },
        { path: "milestones", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return tasks;
  }

  async getTasksByMilestone(milestoneId: string): Promise<ITask[]> {
    const tasks = await Task.find({ milestones: milestoneId })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "reporter", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
        { path: "epic", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return tasks;
  }

  async updateTaskStatus(
    taskId: string,
    status: string,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        status,
        updatedBy: user._id,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);

    return task;
  }

  async updateTaskPriority(
    taskId: string,
    priority: string,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        priority,
        updatedBy: user._id,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);

    return task;
  }

  async deleteManyTasks(
    taskIds: string[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const taskId of taskIds) {
      try {
        const result = await Task.findByIdAndDelete(taskId);
        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }
}

export default new TaskService();
