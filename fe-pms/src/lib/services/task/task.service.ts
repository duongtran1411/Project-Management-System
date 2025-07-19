import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import { TaskModel } from "@/models/task/task.model";

export const createTask = async (task: TaskModel) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Task.CREATE_TASK}`, task);

    if (response.status === 201) {
      showSuccessToast("Create new task successfully!");
      return response.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to create new task!");
    }
  }
};

export const getTasksByProject = async (
  projectId: string
): Promise<TaskModel[] | null> => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.Task.GET_BY_PROJECT(projectId));

    return response.data?.data || [];
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to fetch tasks.";
    showErrorToast(message);
    return null;
  }
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_STATUS(taskId), { status });

    if (response.data?.success) {
      showSuccessToast("Cập nhật trạng thái nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Lỗi khi cập nhật trạng thái task!";
    showErrorToast(message);
    throw error;
  }
};

export const getTasksByAssignee = async (
  userId: string
): Promise<TaskModel[] | null> => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.Task.GET_BY_ASSIGNEE(userId));

    return response.data?.data || [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Không thể lấy danh sách task được giao!";
    showErrorToast(message);
    return null;
  }
};

export const updateAssigneeTask = async (taskId: string, assignee: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(`${Endpoints.Task.UPDATE_ASSIGNEE(taskId)}`, {
        assignee: assignee,
      });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Không thể lấy gán task đã giao!";
    showErrorToast(message);
    return null;
  }
};

export const updateDescriptionTask = async (
  taskId: string,
  description: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(`${Endpoints.Task.UPDATE_DESCRIPTION(taskId)}`, {
        description: description,
      });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Không thể lấy gán task đã giao!";
    showErrorToast(message);
    return null;
  }
};

export const updateEpicTask = async (taskId: string, epicId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(`${Endpoints.Task.UPDATE_EPIC(taskId)}`, {
        epic: epicId,
      });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Không thể lấy gán task đã giao!";
    showErrorToast(message);
    return null;
  }
};

export const getTasksByEpic = async (
  epicId: string
): Promise<TaskModel[] | null> => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.Task.GET_BY_EPIC(epicId));

    return response.data?.data || [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Không thể lấy danh sách task theo Epic!";
    showErrorToast(message);
    return null;
  }
};

export const updatePriorityTask = async (taskId: string, priority: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_PRIORITY(taskId), { priority });

    if (response.data?.success) {
      showSuccessToast("Cập nhật dộ ưu tiên thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Lỗi khi cập nhật độ ưu tiên task!";
    showErrorToast(message);
    throw error;
  }
};

// Delete task
export const deleteTaskMultiple = async (taskIds: string[]) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(Endpoints.Task.DELETE_TASKS, { data: { taskIds } });

    if (response.data?.success) {
      showSuccessToast("Xóa nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Xóa thất bại");
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi xóa task!";
    showErrorToast(message);
    throw error;
  }
};

export const deleteOneTask = async (taskId:string)=>{
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(`${Endpoints.Task.DELETE_TASK(taskId)}`);

    return response.data
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi xóa task!";
    showErrorToast(message);
    throw error;
  }
}

export const updateTaskAssignee = async (
  taskId: string,
  assignee: string | null
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_ASSIGNEE(taskId), { assignee });

    if (response.data?.success) {
      showSuccessToast("Cập nhật nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi cập nhật task!";
    showErrorToast(message);
    throw error;
  }
};

export const updateTaskEpic = async (taskId: string, epic: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_EPIC(taskId), { epic });

    if (response.data?.success) {
      showSuccessToast("Cập nhật nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi cập nhật task!";
    showErrorToast(message);
    throw error;
  }
};

export const updateTaskDescription = async (
  taskId: string,
  description: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_DESCRIPTION(taskId), { description });

    if (response.data?.success) {
      showSuccessToast("Cập nhật nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi cập nhật task!";
    showErrorToast(message);
    throw error;
  }
};

export const updateTaskDate = async (
  taskId: string,
  payload: Partial<{ startDate: string; dueDate: string }>
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_DATE(taskId), payload);

    if (response.data?.success) {
      showSuccessToast("Cập nhật nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi cập nhật task!";
    showErrorToast(message);
    throw error;
  }
};

export const updateTaskReporter = async (taskId: string, reporter: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_REPORTER(taskId), { reporter });

    if (response.data?.success) {
      showSuccessToast("Cập nhật nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi cập nhật task!";
    showErrorToast(message);
    throw error;
  }
};

export const updateReporterForTask = async (taskId: string, reporter: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_REPORTER(taskId), { reporter });

    return response.data
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi cập nhật task!";
    showErrorToast(message);
    throw error;
  }
};



export const updateTaskName = async (taskId: string, name: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_NAME(taskId), { name });

    if (response.data?.success) {
      showSuccessToast("Cập nhật tên nhiệm vụ thành công!");
      return response?.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Lỗi khi cập nhật tên task!";
    showErrorToast(message);
    throw error;
  }
};
