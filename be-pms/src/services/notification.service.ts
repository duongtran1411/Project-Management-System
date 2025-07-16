import Notification, {
  INotification,
  CreateNotificationData,
  NotificationQuery,
  NotificationStats,
  NotificationResponse,
} from "../models/notification.model";
import User from "../models/user.model";
import Task from "../models/task.model";
import Project from "../models/project.model";
import Epic from "../models/epic.model";
import Milestone from "../models/milestone.model";
import Comment from "../models/comment.model";
import mongoose from "mongoose";

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(
    data: CreateNotificationData
  ): Promise<INotification> {
    try {
      const { recipientId, senderId, type, entityType, entityId, metadata } =
        data;

      // Generate title and message based on type
      const { title, message } = await this.generateNotificationContent(
        type,
        entityType,
        entityId,
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

      return await notification.save();
    } catch (error: any) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Generate notification title and message based on type
   */
  private async generateNotificationContent(
    type: string,
    entityType: string,
    entityId: string,
    metadata?: any
  ): Promise<{ title: string; message: string }> {
    const sender = await User.findById(metadata?.senderId || entityId).select(
      "fullName"
    );
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

  /**
   * Get notifications for a user with pagination
   */
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

  /**
   * Get notification statistics for a user
   */
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

  /**
   * Mark notification as read
   */
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

      return notification;
    } catch (error: any) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    try {
      const result = await Notification.updateMany(
        {
          recipientId: new mongoose.Types.ObjectId(userId),
          isRead: false,
        },
        { isRead: true }
      );

      return { modifiedCount: result.modifiedCount };
    } catch (error: any) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`
      );
    }
  }

  /**
   * Archive a notification
   */
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

  /**
   * Delete a notification
   */
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

  /**
   * Create mention notifications for users mentioned in comments
   */
  async createMentionNotifications(
    commentId: string,
    senderId: string,
    mentionedUserIds: string[],
    commentText: string
  ): Promise<INotification[]> {
    try {
      const comment = await Comment.findById(commentId).populate("task");
      // comment.task is an ObjectId or a populated Task
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

  /**
   * Create task update notifications
   */
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

      // Get all users who should be notified (assignee, project members, etc.)
      const recipients = new Set<string>();

      if (task?.assignee) {
        recipients.add(task.assignee.toString());
      }

      // Add project contributors if available
      // This would need to be implemented based on your project contributor model

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
