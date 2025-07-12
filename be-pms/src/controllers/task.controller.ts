import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import taskService from "../services/task.service";

export class TaskController {
  createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const taskData = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

      const task = await taskService.createTask(taskData, user);

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
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

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

  updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

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
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Không có quyền truy cập",
          statusCode: 401,
        });
        return;
      }

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
}

export default new TaskController();
