import { Server as ServerHttp } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export interface SocketEvents {
  "join-user": (userId: string) => void;
  "leave-user": (userId: string) => void;
  "join-project": (projectId: string) => void;
  "leave-project": (projectId: string) => void;
  "open-comment-task": (taskId: string) => void;
  "leave-comment-task": (taskId: string) => void;
  "send-comment": (data: {
    taskId: string;
    message: string;
    user: any;
  }) => void;
  "new-comment": (data: {
    comment: any;
    taskId: string;
    timestamp: Date;
  }) => void;
  "comment-updated": (data: {
    comment: any;
    taskId: string;
    timestamp: Date;
  }) => void;
  "comment-deleted": (data: {
    commentId: string;
    taskId: string;
    timestamp: Date;
  }) => void;
  "new-notification": (data: { notification: any; timestamp: Date }) => void;
  "notification-read": (data: {
    notificationId: string;
    timestamp: Date;
  }) => void;
  "all-notifications-read": (data: { count: number; timestamp: Date }) => void;
  "notification-stats-updated": (data: { stats: any; timestamp: Date }) => void;
}

const initSocket = (httpServer: ServerHttp) => {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.FRONTEND_URL ||
        "https://project-management-system-1ok8.vercel.app/",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", async (socket: Socket) => {
    socket.on("join-user", (userId: string) => {
      socket.join(`user-${userId}`);
    });

    socket.on("leave-user", (userId: string) => {
      socket.leave(`user-${userId}`);
    });

    socket.on("join-project", (projectId: string) => {
      socket.join(`project-${projectId}`);
    });

    socket.on("leave-project", (projectId: string) => {
      socket.leave(`project-${projectId}`);
    });

    socket.on("open-comment-task", (taskId: string) => {
      socket.join(`task-${taskId}`);
    });

    socket.on("leave-comment-task", (taskId: string) => {
      socket.leave(`task-${taskId}`);
    });

    socket.on(
      "send-comment",
      (data: { taskId: string; message: string; user: any }) => {
        io?.to(`task-${data.taskId}`).emit("receive-comment", {
          message: data.message,
          user: data.user,
          timestamp: new Date(),
        });
      }
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitTaskCreated = (task: any, projectId: string) => {
  if (io) {
    io.to(`project-${projectId}`).emit("new-task", {
      task,
      projectId,
      type: "created",
      timestamp: new Date(),
    });
  }
};

export const emitTaskUpdated = (task: any, projectId: string, changes: any) => {
  if (io) {
    io.to(`project-${projectId}`).emit("task-modified", {
      task,
      projectId,
      changes,
      type: "updated",
      timestamp: new Date(),
    });
  }
};

export const emitTaskStatusChanged = (
  task: any,
  projectId: string,
  oldStatus: string,
  newStatus: string
) => {
  if (io) {
    io.to(`project-${projectId}`).emit("task-status-updated", {
      task,
      projectId,
      oldStatus,
      newStatus,
      type: "status-changed",
      timestamp: new Date(),
    });
  }
};

export const emitTaskAssigned = (
  task: any,
  projectId: string,
  oldAssignee: any,
  newAssignee: any
) => {
  if (io) {
    io.to(`project-${projectId}`).emit("task-assignment-changed", {
      task,
      projectId,
      oldAssignee,
      newAssignee,
      type: "assigned",
      timestamp: new Date(),
    });
  }
};

export const emitTaskDeleted = (taskId: string, projectId: string) => {
  if (io) {
    io.to(`project-${projectId}`).emit("task-removed", {
      taskId,
      projectId,
      type: "deleted",
      timestamp: new Date(),
    });
  }
};

export const emitNewNotification = (notification: any, recipientId: string) => {
  if (io) {
    io.to(`user-${recipientId}`).emit("new-notification", {
      notification,
      timestamp: new Date(),
    });
  }
};

export const emitNotificationRead = (
  notificationId: string,
  recipientId: string
) => {
  if (io) {
    io.to(`user-${recipientId}`).emit("notification-read", {
      notificationId,
      timestamp: new Date(),
    });
  }
};

export const emitAllNotificationsRead = (
  recipientId: string,
  count: number
) => {
  if (io) {
    io.to(`user-${recipientId}`).emit("all-notifications-read", {
      count,
      timestamp: new Date(),
    });
  }
};

export const emitNotificationStatsUpdate = (
  recipientId: string,
  stats: any
) => {
  if (io) {
    io.to(`user-${recipientId}`).emit("notification-stats-updated", {
      stats,
      timestamp: new Date(),
    });
  }
};

// Comment realtime events
export const emitNewComment = (comment: any, taskId: string) => {
  if (io) {
    io.to(`task-${taskId}`).emit("new-comment", {
      comment,
      taskId,
      timestamp: new Date(),
    });
  }
};

export const emitCommentUpdated = (comment: any, taskId: string) => {
  if (io) {
    io.to(`task-${taskId}`).emit("comment-updated", {
      comment,
      taskId,
      timestamp: new Date(),
    });
  }
};

export const emitCommentDeleted = (commentId: string, taskId: string) => {
  if (io) {
    io.to(`task-${taskId}`).emit("comment-deleted", {
      commentId,
      taskId,
      timestamp: new Date(),
    });
  }
};

export const emitFileUpload = (data: {
  taskId: string;
  files: Array<{ filename: string; url: string }>;
  uploadedBy: string;
  timestamp: Date;
}) => {
  if (io) {
    io.to(`task-${data.taskId}`).emit("file-uploaded", {
      ...data,
      timestamp: new Date(),
    });
  }
};

export const getSocketInstance = () => io;

export default initSocket;
