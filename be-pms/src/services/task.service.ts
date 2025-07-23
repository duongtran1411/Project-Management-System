import { Server } from "socket.io";
import Task, { ITask } from "../models/task.model";
import NotificationService from "./notification.service";
import {
  emitNewNotification,
  emitNotificationStatsUpdate,
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskStatusChanged,
  emitTaskAssigned,
  emitTaskDeleted,
} from "../utils/socket";
import { IUser, Milestone } from "../models";
import {
  sendTaskAssignmentEmail,
  sendTaskStatusChangeEmail,
  sendTaskUpdateEmail,
  sendTaskUnassignedEmail,
  sendTaskCreatedEmail,
  sendEmailAsync,
} from "../utils/email.util";
import User from "../models/user.model";
export class TaskService {
  private io: Server | null = null;

  setSocketIO(io: Server) {
    this.io = io;
  }

  private getTaskUrl(projectId: any, taskId: any): string {
    if (!projectId || !taskId) return "";
    return `http://localhost:3000/workspace/project-management/${projectId}/detail-task/${taskId}`;
  }

  private async emitNotificationEvent(notification: any, recipientId: string) {
    try {
      const populatedNotification =
        await NotificationService.getNotificationById(
          (notification._id as any).toString()
        );
      if (populatedNotification) {
        emitNewNotification(populatedNotification, recipientId);
        const stats = await NotificationService.getNotificationStats(
          recipientId
        );
        emitNotificationStatsUpdate(recipientId, stats);
      }
    } catch (error) {
      console.error("Failed to emit notification event:", error);
    }
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

    const projectName =
      typeof populatedTask.projectId === "object" &&
      populatedTask.projectId !== null &&
      "name" in populatedTask.projectId
        ? (populatedTask.projectId as { name?: string }).name ||
          "Unknown Project"
        : "Unknown Project";

    try {
      // Send email to assignee if assigned
      if (
        taskData.assignee &&
        taskData.assignee.toString() !== user._id.toString()
      ) {
        const assigneeUser = await User.findById(taskData.assignee).select(
          "fullName email"
        );
        if (assigneeUser && assigneeUser.email) {
          console.log("taskId", taskData.projectId);
          sendEmailAsync(async () => {
            await sendTaskAssignmentEmail(
              assigneeUser.email,
              assigneeUser.fullName || "User",
              taskData.name || "Unnamed Task",
              projectName,
              (user.fullName as string) ||
                (user.email as string) ||
                "Unknown User",

              this.getTaskUrl(task.projectId?._id.toString(), task._id)
            );
          }, 1000);
        }

        const notification = await NotificationService.createNotification({
          recipientId: taskData.assignee.toString(),
          senderId: user._id.toString(),
          type: "TASK_ASSIGNED",
          entityType: "Task",
          entityId: (task._id as any).toString(),
          metadata: {
            taskName: taskData.name,
            projectName:
              typeof populatedTask.projectId === "object" &&
              populatedTask.projectId !== null &&
              "name" in populatedTask.projectId
                ? (populatedTask.projectId as { name?: string }).name
                : undefined,
          },
        });

        await this.emitNotificationEvent(
          notification,
          taskData.assignee.toString()
        );
      }

      // Send email to reporter if different from creator
      if (
        taskData.reporter &&
        taskData.reporter.toString() !== user._id.toString()
      ) {
        const reporterUser = await User.findById(taskData.reporter).select(
          "fullName email"
        );
        if (reporterUser && reporterUser.email) {
          sendEmailAsync(async () => {
            await sendTaskCreatedEmail(
              reporterUser.email,
              reporterUser.fullName || "User",
              taskData.name || "Unnamed Task",
              projectName,
              (user.fullName as string) ||
                (user.email as string) ||
                "Unknown User",
              this.getTaskUrl(task.projectId?._id.toString(), task._id)
            );
          }, 1000);
        }

        const notification = await NotificationService.createNotification({
          recipientId: taskData.reporter.toString(),
          senderId: user._id.toString(),
          type: "TASK_CREATED",
          entityType: "Task",
          entityId: (task._id as any).toString(),
          metadata: {
            taskName: taskData.name,
            projectName:
              typeof populatedTask.projectId === "object" &&
              populatedTask.projectId !== null &&
              "name" in populatedTask.projectId
                ? (populatedTask.projectId as { name?: string }).name
                : undefined,
          },
        });

        await this.emitNotificationEvent(
          notification,
          taskData.reporter.toString()
        );
      }
    } catch (error) {
      console.error("Failed to create task notifications:", error);
    }

    // Emit realtime event for task creation
    emitTaskCreated(populatedTask, taskData.projectId.toString());

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
      { path: "createdBy", select: "fullName email avatar" },
      { path: "updatedBy", select: "fullName email avatar" },
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

    if (task && oldTask) {
      const projectName =
        typeof task.projectId === "object" &&
        task.projectId !== null &&
        "name" in task.projectId
          ? (task.projectId as { name?: string }).name || "Unknown Project"
          : "Unknown Project";

      try {
        // Send email for status change
        if (
          updateData.status &&
          oldTask.status !== updateData.status &&
          task.assignee
        ) {
          const assigneeUser = await User.findById(task.assignee).select(
            "fullName email"
          );
          if (assigneeUser && assigneeUser.email) {
            sendEmailAsync(async () => {
              await sendTaskStatusChangeEmail(
                assigneeUser.email,
                assigneeUser.fullName || "User",
                task.name,
                projectName,
                oldTask.status,
                updateData.status || "",
                (user.fullName as string) ||
                  (user.email as string) ||
                  "Unknown User",
                this.getTaskUrl(task.projectId?._id.toString(), task._id)
              );
            }, 1000);
          }

          const notification = await NotificationService.createNotification({
            recipientId: task.assignee.toString(),
            senderId: user._id.toString(),
            type: "TASK_STATUS_CHANGED",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
              taskStatus: updateData.status,
            },
          });

          await this.emitNotificationEvent(
            notification,
            task.assignee.toString()
          );
        }

        // Send email for new assignee
        if (
          updateData.assignee &&
          oldTask.assignee?.toString() !== updateData.assignee?.toString() &&
          updateData.assignee.toString() !== user._id.toString()
        ) {
          const newAssigneeUser = await User.findById(
            updateData.assignee
          ).select("fullName email");
          if (newAssigneeUser && newAssigneeUser.email) {
            sendEmailAsync(async () => {
              await sendTaskAssignmentEmail(
                newAssigneeUser.email,
                newAssigneeUser.fullName || "User",
                task.name,
                projectName,
                (user.fullName as string) ||
                  (user.email as string) ||
                  "Unknown User",
                this.getTaskUrl(task.projectId?._id.toString(), task._id)
              );
            }, 1000);
          }

          const notification = await NotificationService.createNotification({
            recipientId: updateData.assignee.toString(),
            senderId: user._id.toString(),
            type: "TASK_ASSIGNED",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
            },
          });

          await this.emitNotificationEvent(
            notification,
            updateData.assignee.toString()
          );
        }

        // Case 2: Unassign task (xóa assignee - assignee = null/undefined/empty string)
        const assigneeValue = updateData.assignee?.toString();
        const isUnassign = !assigneeValue || assigneeValue === "";

        if (
          isUnassign &&
          oldTask.assignee &&
          oldTask.assignee.toString() !== user._id.toString()
        ) {
          const oldAssigneeUser = await User.findById(oldTask.assignee).select(
            "fullName email"
          );
          if (oldAssigneeUser && oldAssigneeUser.email) {
            sendEmailAsync(async () => {
              await sendTaskUnassignedEmail(
                oldAssigneeUser.email,
                oldAssigneeUser.fullName || "User",
                task.name,
                projectName,
                (user.fullName as string) ||
                  (user.email as string) ||
                  "Unknown User",
                this.getTaskUrl(task.projectId?._id.toString(), task._id)
              );
            }, 1000);
          }

          const notification = await NotificationService.createNotification({
            recipientId: oldTask.assignee.toString(),
            senderId: user._id.toString(),
            type: "TASK_UNASSIGNED",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
            },
          });

          await this.emitNotificationEvent(
            notification,
            oldTask.assignee.toString()
          );
        }

        // Case 3: Reassign task (thay đổi từ assignee cũ sang assignee mới)
        if (
          updateData.assignee &&
          oldTask.assignee &&
          oldTask.assignee.toString() !== updateData.assignee?.toString() &&
          oldTask.assignee.toString() !== user._id.toString()
        ) {
          const oldAssigneeUser = await User.findById(oldTask.assignee).select(
            "fullName email"
          );
          if (oldAssigneeUser && oldAssigneeUser.email) {
            sendEmailAsync(async () => {
              await sendTaskUnassignedEmail(
                oldAssigneeUser.email,
                oldAssigneeUser.fullName || "User",
                task.name,
                projectName,
                (user.fullName as string) ||
                  (user.email as string) ||
                  "Unknown User",
                this.getTaskUrl(task.projectId?._id.toString(), task._id)
              );
            }, 1000);
          }

          const notification = await NotificationService.createNotification({
            recipientId: oldTask.assignee.toString(),
            senderId: user._id.toString(),
            type: "TASK_UNASSIGNED",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
            },
          });

          await this.emitNotificationEvent(
            notification,
            oldTask.assignee.toString()
          );
        }

        if (task.reporter && task.reporter.toString() !== user._id.toString()) {
          const notification = await NotificationService.createNotification({
            recipientId: task.reporter.toString(),
            senderId: user._id.toString(),
            type: "TASK_UPDATE",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
            },
          });

          await this.emitNotificationEvent(
            notification,
            task.reporter.toString()
          );
        }
      } catch (error) {
        console.error("Failed to create task update notifications:", error);
      }
    }

    // Emit realtime events for task updates
    if (task && oldTask && task.projectId) {
      if (updateData.status && oldTask.status !== updateData.status) {
        emitTaskStatusChanged(
          task,
          task.projectId.toString(),
          oldTask.status,
          updateData.status
        );
      }

      if (oldTask.assignee?.toString() !== updateData.assignee?.toString()) {
        emitTaskAssigned(
          task,
          task.projectId.toString(),
          oldTask.assignee,
          updateData.assignee
        );
      }

      emitTaskUpdated(task, task.projectId.toString(), updateData);
    }

    return task;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const task = await Task.findById(taskId);
    const result = await Task.findByIdAndDelete(taskId);

    // Emit realtime event for task deletion
    if (result && task && task.projectId) {
      emitTaskDeleted(taskId, task.projectId.toString());
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

  async getTasksByProjectId(projectId: string): Promise<ITask[]> {
    const milestone = await Milestone.find({
      projectId: projectId,
      status: "ACTIVE",
    });

    const milestoneIds = await milestone.map((m) => m._id);
    const tasks = await Task.find({ milestones: milestoneIds })
      .populate([
        { path: "milestones", select: "_id name" },
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

    // Send email notification for status change
    if (task && oldTask && oldTask.status !== status && task.assignee) {
      const projectName =
        typeof task.projectId === "object" &&
        task.projectId !== null &&
        "name" in task.projectId
          ? (task.projectId as { name?: string }).name || "Unknown Project"
          : "Unknown Project";

      const assigneeUser = await User.findById(task.assignee).select(
        "fullName email"
      );
      if (assigneeUser && assigneeUser.email) {
        sendEmailAsync(async () => {
          await sendTaskStatusChangeEmail(
            assigneeUser.email,
            assigneeUser.fullName || "User",
            task.name,
            projectName,
            oldTask.status,
            status,
            (user.fullName as string) ||
              (user.email as string) ||
              "Unknown User",
            this.getTaskUrl(task.projectId?._id.toString(), task._id)
          );
        }, 1000);
      }
    }

    // Emit realtime event for status change
    if (task && oldTask && oldTask.status !== status && task.projectId) {
      emitTaskStatusChanged(
        task,
        task.projectId.toString(),
        oldTask.status,
        status
      );
      emitTaskUpdated(task, task.projectId.toString(), { status });
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

    // Emit realtime event for priority change
    if (task && task.projectId) {
      emitTaskUpdated(task, task.projectId.toString(), { priority });
    }

    return task;
  }

  async updateTaskName(
    taskId: string,
    name: string,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        name,
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

    // Emit realtime event for name change
    if (task && task.projectId) {
      emitTaskUpdated(task, task.projectId.toString(), { name });
    }

    return task;
  }

  async updateTaskDescription(
    taskId: string,
    description: string,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        description,
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

    // Emit realtime event for description change
    if (task && task.projectId) {
      emitTaskUpdated(task, task.projectId.toString(), { description });
    }

    return task;
  }

  async updateTaskAssignee(
    taskId: string,
    assignee: string | null,
    user: any
  ): Promise<ITask | null> {
    const oldTask = await Task.findById(taskId);

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        assignee,
        updatedBy: user._id,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "_id name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);

    if (task && oldTask) {
      const projectName =
        typeof task.projectId === "object" &&
        task.projectId !== null &&
        "name" in task.projectId
          ? (task.projectId as { name?: string }).name || "Unknown Project"
          : "Unknown Project";

      try {
        // Case 1: Assign task (có assignee mới và khác với assignee cũ)
        if (
          assignee &&
          oldTask.assignee?.toString() !== assignee &&
          assignee !== user._id.toString()
        ) {
          const newAssigneeUser = await User.findById(assignee).select(
            "fullName email"
          );
          if (newAssigneeUser && newAssigneeUser.email) {
            sendEmailAsync(async () => {
              await sendTaskAssignmentEmail(
                newAssigneeUser.email,
                newAssigneeUser.fullName || "User",
                task.name,
                projectName,
                (user.fullName as string) ||
                  (user.email as string) ||
                  "Unknown User",
                this.getTaskUrl(task.projectId?._id.toString(), task._id)
              );
            }, 1000);
          }

          const notification = await NotificationService.createNotification({
            recipientId: assignee,
            senderId: user._id.toString(),
            type: "TASK_ASSIGNED",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
            },
          });

          await this.emitNotificationEvent(notification, assignee);
        }

        // Case 2: Unassign task (xóa assignee - assignee = null/undefined)
        if (
          !assignee &&
          oldTask.assignee &&
          oldTask.assignee.toString() !== user._id.toString()
        ) {
          const oldAssigneeUser = await User.findById(oldTask.assignee).select(
            "fullName email"
          );
          if (oldAssigneeUser && oldAssigneeUser.email) {
            sendEmailAsync(async () => {
              await sendTaskUnassignedEmail(
                oldAssigneeUser.email,
                oldAssigneeUser.fullName || "User",
                task.name,
                projectName,
                (user.fullName as string) ||
                  (user.email as string) ||
                  "Unknown User",
                this.getTaskUrl(task.projectId?._id, task._id)
              );
            }, 1000);
          }

          const notification = await NotificationService.createNotification({
            recipientId: oldTask.assignee.toString(),
            senderId: user._id.toString(),
            type: "TASK_UNASSIGNED",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
            },
          });

          await this.emitNotificationEvent(
            notification,
            oldTask.assignee.toString()
          );
        }

        // Case 3: Reassign task (thay đổi từ assignee cũ sang assignee mới)
        if (
          assignee &&
          oldTask.assignee &&
          oldTask.assignee.toString() !== assignee &&
          oldTask.assignee.toString() !== user._id.toString()
        ) {
          const oldAssigneeUser = await User.findById(oldTask.assignee).select(
            "fullName email"
          );
          if (oldAssigneeUser && oldAssigneeUser.email) {
            sendEmailAsync(async () => {
              await sendTaskUnassignedEmail(
                oldAssigneeUser.email,
                oldAssigneeUser.fullName || "User",
                task.name,
                projectName,
                (user.fullName as string) ||
                  (user.email as string) ||
                  "Unknown User",
                this.getTaskUrl(task.projectId?._id.toString(), task._id)
              );
            }, 1000);
          }

          const notification = await NotificationService.createNotification({
            recipientId: oldTask.assignee.toString(),
            senderId: user._id.toString(),
            type: "TASK_UNASSIGNED",
            entityType: "Task",
            entityId: (task._id as any).toString(),
            metadata: {
              taskName: task.name,
              projectName:
                typeof task.projectId === "object" &&
                task.projectId !== null &&
                "name" in task.projectId
                  ? (task.projectId as { name?: string }).name
                  : undefined,
            },
          });

          await this.emitNotificationEvent(
            notification,
            oldTask.assignee.toString()
          );
        }
      } catch (error) {
        console.error("Failed to create assignee change notifications:", error);
      }
    }

    // Emit realtime events for assignee changes
    if (task && oldTask && task.projectId) {
      if (oldTask.assignee?.toString() !== assignee) {
        emitTaskAssigned(
          task,
          task.projectId.toString(),
          oldTask.assignee,
          assignee
        );
        emitTaskUpdated(task, task.projectId.toString(), { assignee });
      }
    }

    return task;
  }

  async updateTaskReporter(
    taskId: string,
    reporter: string,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        reporter,
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

    // Emit realtime event for reporter change
    if (task && task.projectId) {
      emitTaskUpdated(task, task.projectId.toString(), { reporter });
    }

    return task;
  }

  async updateTaskEpic(
    taskId: string,
    epic: string,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        epic,
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

    if (this.io && task) {
      this.io.emit("task-updated", {
        task,
        projectId: task.projectId,
        changes: { epic },
      });
    }

    return task;
  }

  async updateTaskMilestone(
    taskId: string,
    milestone: string,
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        milestones: milestone,
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

    if (this.io && task) {
      this.io.emit("task-updated", {
        task,
        projectId: task.projectId,
        changes: { milestone },
      });
    }

    return task;
  }

  async updateMileStonesForTasks(
    milestoneId: string,
    milestoneIdMove: string,
    user: IUser
  ): Promise<ITask[]> {
    await Milestone.findByIdAndUpdate(milestoneId, { status: "DONE" });

    const updatedTask = await Task.updateMany(
      { milestones: milestoneId, status: { $ne: "DONE" } },
      { $set: { milestones: milestoneIdMove, updatedBy: user._id } }
    );

    await Milestone.findByIdAndUpdate(milestoneIdMove, { status: "ACTIVE" });

    if (!updatedTask) {
      throw new Error("Can not update task");
    }

    const tasks = await Task.find({
      milestones: milestoneIdMove,
      status: { $ne: "DONE" },
    });

    if (!tasks) {
      throw new Error("Can get task has been updated");
    }
    return tasks;
  }

  async updateTaskDates(
    taskId: string,
    startDate: Date | null,
    dueDate: Date | null,
    user: any
  ): Promise<ITask | null> {
    const updateData: any = { updatedBy: user._id };

    if (startDate !== undefined) updateData.startDate = startDate;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const task = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "reporter", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "epic", select: "name description" },
      { path: "milestones", select: "name description" },
    ]);

    if (this.io && task) {
      this.io.emit("task-updated", {
        task,
        projectId: task.projectId,
        changes: { startDate, dueDate },
      });
    }

    return task;
  }

  async updateTaskLabels(
    taskId: string,
    labels: string[],
    user: any
  ): Promise<ITask | null> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        labels,
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

    if (this.io && task) {
      this.io.emit("task-updated", {
        task,
        projectId: task.projectId,
        changes: { labels },
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
          emitTaskDeleted(taskId, task?.projectId?.toString() || "");
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async taskNotDoneByMileStone(milestoneId: string): Promise<number> {
    const task = await Task.find({
      milestones: milestoneId,
      status: { $ne: "DONE" },
    }).countDocuments();

    if (task === 0) {
      return 0;
    }

    return task;
  }

  async getAllTasksForUser(userId: string, filters?: any): Promise<ITask[]> {
    const query: any = {};

    // Lấy tất cả task mà user là assignee hoặc reporter
    query.$or = [
      { assignee: userId },
      { reporter: userId },
      { createdBy: userId },
    ];

    // Áp dụng các filter nếu có
    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.priority) {
      query.priority = filters.priority;
    }

    if (filters?.projectId) {
      query.projectId = filters.projectId;
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
}

export default new TaskService();
