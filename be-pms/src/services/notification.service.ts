import mongoose from "mongoose";
import Comment from "../models/comment.model";
import Notification, {
  CreateNotificationData,
  INotification,
  NotificationQuery,
  NotificationStats,
} from "../models/notification.model";
import Project from "../models/project.model";
import Task from "../models/task.model";
import User from "../models/user.model";
import {
  emitNewNotification,
  emitNotificationRead,
  emitAllNotificationsRead,
  emitNotificationStatsUpdate,
} from "../utils/socket";

class NotificationService {
  async createNotification(
    data: CreateNotificationData
  ): Promise<INotification> {
    try {
      const { recipientId, senderId, type, entityType, entityId, metadata } =
        data;

      const { title, message } = await this.generateNotificationContent(
        type,
        entityType,
        entityId,
        senderId,
        metadata
      );

      const notification = new Notification({
        recipientId: new mongoose.Types.ObjectId(recipientId),
        senderId: new mongoose.Types.ObjectId(senderId),
        type,
        title,
        message,
        entityType,
        entityId: new mongoose.Types.ObjectId(entityId),
        metadata,
      });

      const savedNotification = await notification.save();

      await this.emitNotificationEvent(savedNotification, recipientId);

      return savedNotification;
    } catch (error: any) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  private async emitNotificationEvent(
    notification: INotification,
    recipientId: string
  ) {
    try {
      const populatedNotification = await this.getNotificationById(
        (notification._id as any).toString()
      );
      if (populatedNotification) {
        emitNewNotification(populatedNotification, recipientId);

        const stats = await this.getNotificationStats(recipientId);
        emitNotificationStatsUpdate(recipientId, stats);
      }
    } catch (error) {
      console.error("Failed to emit notification event:", error);
    }
  }

  private async generateNotificationContent(
    type: string,
    entityType: string,
    entityId: string,
    senderId: string,
    metadata?: any
  ): Promise<{ title: string; message: string }> {
    const sender = await User.findById(senderId).select("fullName");
    const senderName = sender?.fullName || "Unknown User";

    switch (type) {
      case "MENTION":
        return {
          title: `${senderName} mentioned you`,
          message: `${senderName} mentioned you in a comment`,
        };

      case "TASK_UPDATE":
        const taskName = metadata?.taskName || "a task";
        return {
          title: `${senderName} updated a task`,
          message: `${senderName} updated ${taskName}`,
        };

      case "TASK_ASSIGNED":
        const assignedTaskName = metadata?.taskName || "a task";
        return {
          title: `Task assigned to you`,
          message: `${senderName} assigned ${assignedTaskName} to you`,
        };

      case "TASK_UNASSIGNED":
        const unassignedTaskName = metadata?.taskName || "a task";
        return {
          title: `Task unassigned`,
          message: `${senderName} unassigned ${unassignedTaskName} from you`,
        };

      case "TASK_STATUS_CHANGED":
        const statusTaskName = metadata?.taskName || "a task";
        const oldStatus = metadata?.oldStatus || "unknown";
        const newStatus = metadata?.newStatus || "unknown";
        return {
          title: `Task status changed`,
          message: `${statusTaskName} status changed from ${oldStatus} to ${newStatus}`,
        };

      case "TASK_CREATED":
        const createdTaskName = metadata?.taskName || "a task";
        return {
          title: `New task created`,
          message: `${senderName} created ${createdTaskName}`,
        };

      case "COMMENT":
        return {
          title: `${senderName} commented`,
          message: `${senderName} added a comment`,
        };

      case "ASSIGNEE_UPDATE":
        const oldAssignee = await User.findById(
          metadata?.assigneeUpdate?.oldAssignee
        ).select("fullName");
        const newAssignee = await User.findById(
          metadata?.assigneeUpdate?.newAssignee
        ).select("fullName");
        return {
          title: `Assignee updated`,
          message: `Task reassigned from ${
            oldAssignee?.fullName || "Unknown"
          } to ${newAssignee?.fullName || "Unknown"}`,
        };

      case "PROJECT_UPDATE":
        const projectName = metadata?.projectName || "a project";
        return {
          title: `${senderName} updated a project`,
          message: `${senderName} updated ${projectName}`,
        };

      case "EPIC_UPDATE":
        const epicName = metadata?.epicName || "an epic";
        return {
          title: `${senderName} updated an epic`,
          message: `${senderName} updated ${epicName}`,
        };

      case "MILESTONE_UPDATE":
        const milestoneName = metadata?.milestoneName || "a milestone";
        return {
          title: `${senderName} updated a milestone`,
          message: `${senderName} updated ${milestoneName}`,
        };

      default:
        return {
          title: "New notification",
          message: "You have a new notification",
        };
    }
  }

  async getNotifications(query: NotificationQuery): Promise<{
    notifications: INotification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        recipientId,
        page = 1,
        limit = 20,
        isRead,
        isArchived,
        type,
        entityType,
      } = query;

      const filter: any = {
        recipientId: new mongoose.Types.ObjectId(recipientId),
      };

      if (isRead !== undefined) filter.isRead = isRead;
      if (isArchived !== undefined) filter.isArchived = isArchived;
      if (type) filter.type = type;
      if (entityType) filter.entityType = entityType;

      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.find(filter)
          .populate("senderId", "fullname avatar email")
          .populate("recipientId", "fullname avatar email")
          .populate("metadata.mentionedUsers", "fullname avatar email")
          .populate(
            "metadata.assigneeUpdate.oldAssignee",
            "fullname avatar email"
          )
          .populate(
            "metadata.assigneeUpdate.newAssignee",
            "fullname avatar email"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notification.countDocuments(filter),
      ]);

      return {
        notifications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  async getNotificationStats(recipientId: string): Promise<NotificationStats> {
    try {
      const [total, unread, archived] = await Promise.all([
        Notification.countDocuments({
          recipientId: new mongoose.Types.ObjectId(recipientId),
        }),
        Notification.countDocuments({
          recipientId: new mongoose.Types.ObjectId(recipientId),
          isRead: false,
          isArchived: false,
        }),
        Notification.countDocuments({
          recipientId: new mongoose.Types.ObjectId(recipientId),
          isArchived: true,
        }),
      ]);

      return { total, unread, archived };
    } catch (error: any) {
      throw new Error(`Failed to get notification stats: ${error.message}`);
    }
  }

  async getNotificationById(
    notificationId: string
  ): Promise<INotification | null> {
    try {
      const notification = await Notification.findById(notificationId)
        .populate("senderId", "fullname avatar email")
        .populate("recipientId", "fullname avatar email")
        .populate("metadata.mentionedUsers", "fullname avatar email")
        .populate(
          "metadata.assigneeUpdate.oldAssignee",
          "fullname avatar email"
        )
        .populate(
          "metadata.assigneeUpdate.newAssignee",
          "fullname avatar email"
        )
        .lean();

      return notification;
    } catch (error: any) {
      throw new Error(`Failed to get notification by ID: ${error.message}`);
    }
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification> {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientId: new mongoose.Types.ObjectId(userId),
        },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new Error("Notification not found or access denied");
      }

      emitNotificationRead(notificationId, userId);
      const stats = await this.getNotificationStats(userId);
      emitNotificationStatsUpdate(userId, stats);

      return notification;
    } catch (error: any) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    try {
      const result = await Notification.updateMany(
        {
          recipientId: new mongoose.Types.ObjectId(userId),
          isRead: false,
        },
        { isRead: true }
      );

      emitAllNotificationsRead(userId, result.modifiedCount);
      const stats = await this.getNotificationStats(userId);
      emitNotificationStatsUpdate(userId, stats);

      return { modifiedCount: result.modifiedCount };
    } catch (error: any) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`
      );
    }
  }

  async archiveNotification(
    notificationId: string,
    userId: string
  ): Promise<INotification> {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientId: new mongoose.Types.ObjectId(userId),
        },
        { isArchived: true },
        { new: true }
      );

      if (!notification) {
        throw new Error("Notification not found or access denied");
      }

      return notification;
    } catch (error: any) {
      throw new Error(`Failed to archive notification: ${error.message}`);
    }
  }

  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    try {
      const result = await Notification.deleteOne({
        _id: notificationId,
        recipientId: new mongoose.Types.ObjectId(userId),
      });

      if (result.deletedCount === 0) {
        throw new Error("Notification not found or access denied");
      }
    } catch (error: any) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  async createMentionNotifications(
    commentId: string,
    senderId: string,
    mentionedUserIds: string[],
    commentText: string
  ): Promise<INotification[]> {
    try {
      const comment = await Comment.findById(commentId).populate("task");
      let task: any = null;
      let project: any = null;

      if (
        comment &&
        comment.task &&
        typeof comment.task === "object" &&
        "name" in comment.task
      ) {
        task = comment.task;
        if (
          task.projectId &&
          typeof task.projectId === "object" &&
          "_id" in task.projectId
        ) {
          project = await Project.findById(task.projectId._id);
        } else if (task.projectId) {
          project = await Project.findById(task.projectId);
        }
      }

      const notifications = await Promise.all(
        mentionedUserIds.map(async (userId) => {
          const notificationData: CreateNotificationData = {
            recipientId: userId,
            senderId,
            type: "MENTION",
            entityType: "Comment",
            entityId: commentId,
            metadata: {
              commentText,
              taskName:
                task && typeof task === "object" && "name" in task
                  ? task.name
                  : undefined,
              taskId: task?._id?.toString(),
              projectName:
                project && typeof project === "object" && "name" in project
                  ? project.name
                  : undefined,
              mentionedUsers: mentionedUserIds,
            },
          };
          return this.createNotification(notificationData);
        })
      );

      return notifications;
    } catch (error: any) {
      throw new Error(
        `Failed to create mention notifications: ${error.message}`
      );
    }
  }

  async createTaskUpdateNotification(
    taskId: string,
    senderId: string,
    updateType: "STATUS_CHANGE" | "ASSIGNEE_CHANGE" | "GENERAL_UPDATE",
    oldData?: any,
    newData?: any
  ): Promise<INotification[]> {
    try {
      const task = await Task.findById(taskId).populate("projectId", "name");
      const project = task?.projectId;

      const recipients = new Set<string>();

      if (task?.assignee) {
        recipients.add(task.assignee.toString());
      }

      const notifications = await Promise.all(
        Array.from(recipients).map(async (recipientId) => {
          const notificationData: CreateNotificationData = {
            recipientId,
            senderId,
            type: "TASK_UPDATE",
            entityType: "Task",
            entityId: taskId,
            metadata: {
              taskName: task?.name,
              taskId: task?._id?.toString(),
              taskStatus: task?.status,
              projectName:
                typeof project === "object" &&
                project &&
                "name" in project &&
                typeof (project as any).name === "string"
                  ? (project as any).name
                  : undefined,
            },
          };

          return this.createNotification(notificationData);
        })
      );

      return notifications;
    } catch (error: any) {
      throw new Error(
        `Failed to create task update notification: ${error.message}`
      );
    }
  }
}

export default new NotificationService();
