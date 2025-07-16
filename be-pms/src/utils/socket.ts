import { Server as ServerHttp } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

const initSocket = (httpServer: ServerHttp) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", async (socket: Socket) => {
    // Join project room for real-time updates
    socket.on("join-project", (projectId: string) => {
      socket.join(`project-${projectId}`);
      console.log(`User joined project: ${projectId}`);
    });

    // Leave project room
    socket.on("leave-project", (projectId: string) => {
      socket.leave(`project-${projectId}`);
      console.log(`User left project: ${projectId}`);
    });

    // Task comment functionality
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

    // Disconnect handling
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

// Socket utility functions for emitting events
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

export default initSocket;
