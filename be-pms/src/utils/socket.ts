import { Server as ServerHttp } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export interface SocketEvents {
  "join-user": (userId: string) => void;
  "leave-user": (userId: string) => void;
  "join-project": (projectId: string) => void;
  "leave-project": (projectId: string) => void;
  "open-comment-task": (taskId: string) => void;
  "send-comment": (data: {
    taskId: string;
    message: string;
    user: any;
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
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", async (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-user", (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined notification room`);
    });

    socket.on("leave-user", (userId: string) => {
      socket.leave(`user-${userId}`);
      console.log(`User ${userId} left notification room`);
    });

    socket.on("join-project", (projectId: string) => {
      socket.join(`project-${projectId}`);
      console.log(`User joined project: ${projectId}`);
    });

    socket.on("leave-project", (projectId: string) => {
      socket.leave(`project-${projectId}`);
      console.log(`User left project: ${projectId}`);
    });

    socket.on("open-comment-task", (taskId: string) => {
      socket.join(`task-${taskId}`);
      console.log(`User opened comments for task: ${taskId}`);
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
    console.log(`Emitted task-created for project: ${projectId}`);
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
    console.log(`Emitted task-updated for project: ${projectId}`);
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
    console.log(`Emitted task-status-changed for project: ${projectId}`);
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
    console.log(`Emitted task-assigned for project: ${projectId}`);
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
    console.log(`Emitted task-deleted for project: ${projectId}`);
  }
};

export const emitNewNotification = (notification: any, recipientId: string) => {
  if (io) {
    io.to(`user-${recipientId}`).emit("new-notification", {
      notification,
      timestamp: new Date(),
    });
    console.log(`Emitted new-notification for user: ${recipientId}`);
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
    console.log(`Emitted notification-read for user: ${recipientId}`);
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
    console.log(`Emitted all-notifications-read for user: ${recipientId}`);
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
    console.log(`Emitted notification-stats-updated for user: ${recipientId}`);
  }
};

export const getSocketInstance = () => io;

export default initSocket;
