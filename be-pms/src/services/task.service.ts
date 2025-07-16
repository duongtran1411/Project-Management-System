import { Server } from "socket.io";
import Task, { ITask } from "../models/task.model";

export class TaskService {
  private io: Server | null = null;

  setSocketIO(io: Server) {
    this.io = io;
  }

  async createTask(taskData: Partial<ITask>, user: any): Promise<ITask> {
    if (!taskData.projectId) {
      throw new Error("Project ID is required");
    }

    const task = await Task.create({
      ...taskData,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const populatedTask = await task.populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);

    // Emit real-time event
    if (this.io) {
      this.io.emit("task-created", {
        task: populatedTask,
        projectId: taskData.projectId,
      });
    }

    return populatedTask;
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
        { path: "createdBy", select: "fullName email avatar" },
        { path: "updatedBy", select: "fullName email avatar" },
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
    // Get the old task data for comparison
    const oldTask = await Task.findById(taskId);

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

    // Emit real-time events for specific changes
    if (this.io && task && oldTask) {
      // Check for status change
      if (updateData.status && oldTask.status !== updateData.status) {
        this.io.emit("task-status-changed", {
          task,
          projectId: task.projectId,
          oldStatus: oldTask.status,
          newStatus: updateData.status,
        });
      }

      // Check for assignment change
      if (
        updateData.assignee &&
        oldTask.assignee?.toString() !== updateData.assignee?.toString()
      ) {
        this.io.emit("task-assigned", {
          task,
          projectId: task.projectId,
          oldAssignee: oldTask.assignee,
          newAssignee: updateData.assignee,
        });
      }

      // Emit general update event
      this.io.emit("task-updated", {
        task,
        projectId: task.projectId,
        changes: updateData,
      });
    }

    return task;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const task = await Task.findById(taskId);
    const result = await Task.findByIdAndDelete(taskId);

    // Emit real-time event
    if (this.io && result && task) {
      this.io.emit("task-deleted", {
        taskId,
        projectId: task.projectId,
      });
    }

    return !!result;
  }

  async getTasksByProject(projectId: string): Promise<ITask[]> {
    const tasks = await Task.find({ projectId })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "reporter", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email avatar" },
        { path: "updatedBy", select: "fullName email avatar" },
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
        { path: "createdBy", select: "fullName email avatar" },
        { path: "updatedBy", select: "fullName email avatar" },
        { path: "projectId", select: "name description" },
        { path: "milestones", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return tasks;
  }

  async getTasksByAssignee(assignee: string): Promise<ITask[]> {
    const tasks = await Task.find({ assignee: assignee })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "reporter", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email avatar" },
        { path: "updatedBy", select: "fullName email avatar" },
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
        { path: "createdBy", select: "fullName email avatar" },
        { path: "updatedBy", select: "fullName email avatar" },
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
    const oldTask = await Task.findById(taskId);

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

    // Emit real-time event for status change
    if (this.io && task && oldTask && oldTask.status !== status) {
      this.io.emit("task-status-changed", {
        task,
        projectId: task.projectId,
        oldStatus: oldTask.status,
        newStatus: status,
      });
    }

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

    // Emit real-time event for priority change
    if (this.io && task) {
      this.io.emit("task-updated", {
        task,
        projectId: task.projectId,
        changes: { priority },
      });
    }

    return task;
  }

  async deleteManyTasks(
    taskIds: string[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const taskId of taskIds) {
      try {
        const task = await Task.findById(taskId);
        const result = await Task.findByIdAndDelete(taskId);
        if (result) {
          success++;
          // Emit real-time event for each deleted task
          if (this.io && task) {
            this.io.emit("task-deleted", {
              taskId,
              projectId: task.projectId,
            });
          }
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
