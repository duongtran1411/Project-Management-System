export interface INotification {
  _id: string;
  recipientId:
    | string
    | { _id: string; fullname: string; avatar?: string; email: string };
  senderId:
    | string
    | { _id: string; fullname: string; avatar?: string; email: string };
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
  entityId: string;
  isRead: boolean;
  isArchived: boolean;
  metadata: {
    taskName?: string;
    taskId?: string;
    projectId?: string;
    taskStatus?: string;
    projectName?: string;
    epicName?: string;
    milestoneName?: string;
    commentText?: string;
    mentionedUsers?:
      | string[]
      | { _id: string; fullname: string; avatar?: string; email: string }[];
    assigneeUpdate?: {
      oldAssignee?:
        | string
        | { _id: string; fullname: string; avatar?: string; email: string };
      newAssignee?:
        | string
        | { _id: string; fullname: string; avatar?: string; email: string };
    };
  };
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;
}

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
  notifications: INotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationApiResponse {
  success: boolean;
  message: string;
  data:
    | INotification
    | INotification[]
    | NotificationResponse
    | NotificationStats
    | { modifiedCount: number };
  statusCode: number;
}
