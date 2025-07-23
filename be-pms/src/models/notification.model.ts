import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type:
    | "MENTION"
    | "TASK_UPDATE"
    | "TASK_ASSIGNED"
    | "TASK_UNASSIGNED"
    | "TASK_STATUS_CHANGED"
    | "TASK_CREATED"
    | "COMMENT"
    | "ASSIGNEE_UPDATE"
    | "PROJECT_UPDATE"
    | "EPIC_UPDATE"
    | "MILESTONE_UPDATE";
  title: string;
  message: string;
  entityType: "Task" | "Project" | "Epic" | "Milestone" | "Comment";
  entityId: mongoose.Types.ObjectId;
  isRead: boolean;
  isArchived: boolean;
  metadata: {
    taskName?: string;
    taskId?: string;
    taskStatus?: string;
    projectName?: string;
    epicName?: string;
    milestoneName?: string;
    commentText?: string;
    mentionedUsers?: mongoose.Types.ObjectId[];
    assigneeUpdate?: {
      oldAssignee?: mongoose.Types.ObjectId;
      newAssignee?: mongoose.Types.ObjectId;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient ID is required"],
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "MENTION",
        "TASK_UPDATE",
        "TASK_ASSIGNED",
        "TASK_UNASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_CREATED",
        "COMMENT",
        "ASSIGNEE_UPDATE",
        "PROJECT_UPDATE",
        "EPIC_UPDATE",
        "MILESTONE_UPDATE",
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: 500,
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      enum: ["Task", "Project", "Epic", "Milestone", "Comment"],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, "Entity ID is required"],
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      taskName: String,
      taskId: String,
      projectId: String,
      taskStatus: String,
      projectName: String,
      epicName: String,
      milestoneName: String,
      commentText: String,
      updateType: String,
      updateDescription: String,
      mentionedUsers: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      assigneeUpdate: {
        oldAssignee: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        newAssignee: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, isArchived: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ entityType: 1, entityId: 1 });

// Virtual for time ago
notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - this.createdAt.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
});

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

// --- Types for Notification Service/Controller ---
export interface CreateNotificationData {
  recipientId: string;
  senderId: string;
  type:
    | "MENTION"
    | "TASK_UPDATE"
    | "TASK_ASSIGNED"
    | "TASK_UNASSIGNED"
    | "TASK_STATUS_CHANGED"
    | "TASK_CREATED"
    | "COMMENT"
    | "ASSIGNEE_UPDATE"
    | "PROJECT_UPDATE"
    | "EPIC_UPDATE"
    | "MILESTONE_UPDATE";
  entityType: "Task" | "Project" | "Epic" | "Milestone" | "Comment";
  entityId: string;
  metadata?: {
    taskName?: string;
    taskId?: string;
    projectId?: string;
    taskStatus?: string;
    projectName?: string;
    epicName?: string;
    milestoneName?: string;
    commentText?: string;
    updateType?: string;
    updateDescription?: string;
    mentionedUsers?: string[];
    assigneeUpdate?: {
      oldAssignee?: string;
      newAssignee?: string;
    };
  };
}

export interface NotificationQuery {
  recipientId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
  isArchived?: boolean;
  type?: string;
  entityType?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
}

export interface NotificationResponse {
  notifications: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
