import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import taskService from "../services/task.service";
import { Server } from "socket.io";
import { io } from "../server";

export class TaskController {
  private io: Server | null = null;

  constructor() {
    this.io = io;
    if (this.io) {
      taskService.setSocketIO(this.io);
    }
  }

  setSocketIO(io: Server) {
    this.io = io;
    taskService.setSocketIO(io);
  }

  createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const taskData = req.body;
      const user = req.user!;

      const task = await taskService.createTask(taskData, user);

      if (this.io) {
        this.io.emit("task-created", {
          task,
          projectId: taskData.projectId,
        });
      }

      res.status(201).json({
        success: true,
        message: "Tạo task thành công",
        data: task,
        statusCode: 201,
      });
    } catch (error: any) {
      console.error("Create task error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Tạo task thất bại",
        statusCode: 400,
      });
    }
  };

  getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, status, priority, assignee, epic, milestones } =
        req.query;
      const filters: any = {};

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (assignee) filters.assignee = assignee;
      if (epic) filters.epic = epic;
      if (milestones) filters.milestones = milestones;

      const tasks = await taskService.getAllTasks(
        projectId as string,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách task thành công",
        data: tasks,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get all tasks error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách task thất bại",
        statusCode: 400,
      });
    }
  };

  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Lấy thông tin task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get task by id error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy thông tin task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user!; // User is guaranteed to exist due to auth middleware

      const task = await taskService.updateTask(id, updateData, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật task thất bại",
        statusCode: 400,
      });
    }
  };

  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await taskService.deleteTask(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Xóa task thành công",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete task error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Xóa task thất bại",
        statusCode: 400,
      });
    }
  };

  getTasksByProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const tasks = await taskService.getTasksByProject(projectId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách task theo dự án thành công",
        data: tasks,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get tasks by project error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách task theo dự án thất bại",
        statusCode: 400,
      });
    }
  };

  getTasksByEpic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { epicId } = req.params;
      const tasks = await taskService.getTasksByEpic(epicId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách task theo epic thành công",
        data: tasks,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get tasks by epic error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách task theo epic thất bại",
        statusCode: 400,
      });
    }
  };

  getTasksByAssignee = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assignee } = req.params;
      const tasks = await taskService.getTasksByAssignee(assignee);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách task theo người được giao thành công",
        data: tasks,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get tasks by assignee error:", error);
      res.status(400).json({
        success: false,
        message:
          error.message || "Lấy danh sách task theo người được giao thất bại",
        statusCode: 400,
      });
    }
  };

  getTasksByMilestone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { milestoneId } = req.params;
      const tasks = await taskService.getTasksByMilestone(milestoneId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách task theo milestone thành công",
        data: tasks,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get tasks by milestone error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách task theo milestone thất bại",
        statusCode: 400,
      });
    }
  };

  getTaskByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const tasks = await taskService.getTasksByProjectId(projectId);
      if (!tasks) {
        res.status(400).json({
          success: true,
          message: "Không thể lấy danh sách task",
          statusCode: 400,
        });
      }
      res.status(200).json({
        success: true,
        message: "Lấy danh sách task theo milestone thành công",
        data: tasks,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get tasks by milestone error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách task theo milestone thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user!; // User is guaranteed to exist due to auth middleware

      if (!status) {
        res.status(400).json({
          success: false,
          message: "Trạng thái là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskStatus(id, status, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task status error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật trạng thái task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskPriority = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      const user = req.user!; // User is guaranteed to exist due to auth middleware

      if (!priority) {
        res.status(400).json({
          success: false,
          message: "Độ ưu tiên là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskPriority(id, priority, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật độ ưu tiên task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task priority error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật độ ưu tiên task thất bại",
        statusCode: 400,
      });
    }
  };

  deleteManyTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskIds } = req.body;

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Danh sách task cần xóa không hợp lệ",
          statusCode: 400,
        });
        return;
      }

      const result = await taskService.deleteManyTasks(taskIds);

      res.status(200).json({
        success: true,
        message: `Đã xóa ${result.success} task thành công, ${result.failed} task thất bại`,
        data: result,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Delete many tasks error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Xóa nhiều task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskName = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const user = req.user!;

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Tên task là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskName(id, name, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật tên task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task name error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật tên task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskDescription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { description } = req.body;
      const user = req.user!;

      if (!description) {
        res.status(400).json({
          success: false,
          message: "Mô tả task là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskDescription(
        id,
        description,
        user
      );

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật mô tả task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task description error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật mô tả task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskAssignee = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { assignee } = req.body;
      const user = req.user!;

      // Xử lý unassign khi assignee là null, undefined, hoặc string rỗng
      const finalAssignee =
        assignee === null || assignee === undefined || assignee === ""
          ? null
          : assignee;

      const task = await taskService.updateTaskAssignee(
        id,
        finalAssignee,
        user
      );

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      const message = finalAssignee
        ? "Cập nhật người được giao task thành công"
        : "Hủy giao task thành công";

      res.status(200).json({
        success: true,
        message,
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task assignee error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật người được giao task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskReporter = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { reporter } = req.body;
      const user = req.user!;

      if (!reporter) {
        res.status(400).json({
          success: false,
          message: "Người báo cáo là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskReporter(id, reporter, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật người báo cáo task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task reporter error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật người báo cáo task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskEpic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { epic } = req.body;
      const user = req.user!;

      if (!epic) {
        res.status(400).json({
          success: false,
          message: "Epic là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskEpic(id, epic, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật epic task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task epic error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật epic task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskMilestone = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { milestone } = req.body;
      const user = req.user!;

      if (!milestone) {
        res.status(400).json({
          success: false,
          message: "Milestone là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskMilestone(id, milestone, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật milestone task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task milestone error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật milestone task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskDates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { startDate, dueDate } = req.body;
      const user = req.user!;

      const task = await taskService.updateTaskDates(
        id,
        startDate,
        dueDate,
        user
      );

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật ngày tháng task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task dates error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật ngày tháng task thất bại",
        statusCode: 400,
      });
    }
  };

  updateTaskLabels = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { labels } = req.body;
      const user = req.user!;

      if (!Array.isArray(labels)) {
        res.status(400).json({
          success: false,
          message: "Labels phải là một mảng",
          statusCode: 400,
        });
        return;
      }

      const task = await taskService.updateTaskLabels(id, labels, user);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật labels task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task labels error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật labels task thất bại",
        statusCode: 400,
      });
    }
  };

  countTaskNotDoneByMileStone = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { milestoneId } = req.params;
      if (!milestoneId)
        res.status(400).json({
          status: 400,
          success: false,
          message: `can not find task by milestone id ${milestoneId}`,
        });
      const numberTask = await taskService.taskNotDoneByMileStone(milestoneId);

      res.status(200).json({
        status: 200,
        success: true,
        number: numberTask,
      });
    } catch (error: any) {
      console.error("Update task labels error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật labels task thất bại",
        statusCode: 400,
      });
    }
  };

  updateMileStonesForTask = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { milestoneId } = req.params;
      const { milestonesIdMove } = req.body;
      const user = req.user!;

      if (!milestoneId && !milestonesIdMove) {
        res.status(400).json({
          success: false,
          message: "Milestone là bắt buộc",
          statusCode: 400,
        });
      }

      const task = await taskService.updateMileStonesForTasks(
        milestoneId,
        milestonesIdMove,
        user
      );

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy task",
          statusCode: 404,
        });
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật milestone task thành công",
        data: task,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Update task milestone error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Cập nhật milestone task thất bại",
        statusCode: 400,
      });
    }
  };

  getAllTasksForCurrentUser = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const user = req.user!;
      const { status, priority, projectId, epic, milestones } = req.query;
      const filters: any = {};

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (projectId) filters.projectId = projectId;
      if (epic) filters.epic = epic;
      if (milestones) filters.milestones = milestones;

      const tasks = await taskService.getAllTasksForUser(
        user._id.toString(),
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách task của user thành công",
        data: tasks,
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Get all tasks for user error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy danh sách task của user thất bại",
        statusCode: 400,
      });
    }
  };
}

export default new TaskController();
