import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import { TaskModel } from "@/models/task/task.model";
import axiosService from "../axios.service";

export const createTask = async (task: TaskModel) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Task.CREATE_TASK}`, task);

    if (response.status === 201) {
      showSuccessToast(
        response.data?.message || "Create new task successfully!"
      );
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




// export const updateTaskStatus = async (taskId: string, status: string) => {
//   try {
//     const response = await axiosService
//       .getAxiosInstance()
//       .put(Endpoints.Task.UPDATE_TASK(taskId), { status }); 

//     if (response.data?.success) {
//       showSuccessToast("Cập nhật trạng thái status thành công!");
//       return response.data.data;
//     } else {
//       throw new Error(response.data?.message || "Cập nhật thất bại");
//     }
//   } catch (error: any) {
//     const message =
//       error?.response?.data?.message || "Lỗi khi cập nhật trạng thái task!";
//     showErrorToast(message);
//     throw error;
//   }
// };

export const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_TASK(taskId), { status });
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
    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật assignee của nhiệm vụ thành công!"
      );
      return response.data;
    }
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
    if (response.status === 200) {
      showSuccessToast(
        response.data?.message ||
          "Cập nhật description của nhiệm vụ thành công!"
      );
      return response.data;
    }
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
    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật epic của nhiệm vụ thành công!"
      );
      return response.data;
    }
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

    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật dộ ưu tiên thành công!"
      );
      return response?.data.data;
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

    if (response.status === 200) {
      showSuccessToast("Xóa nhiệm vụ thành công!");
      return response?.data.data;
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Lỗi khi xóa task!";
    showErrorToast(message);
    throw error;
  }
};

export const updateTaskAssignee = async (
  taskId: string,
  assignee: string | null
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Task.UPDATE_ASSIGNEE(taskId), { assignee });

    if (response.status === 200) {
      showSuccessToast("Cập nhật nhiệm vụ thành công!");
      return response?.data.data;
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

    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật epic của nhiệm vụ thành công!"
      );
      return response?.data.data;
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

    if (response.status === 200) {
      showSuccessToast(
        response.data?.message ||
          "Cập nhật description của nhiệm vụ thành công!"
      );
      return response?.data.data;
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

    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật ngày của nhiệm vụ thành công!"
      );
      return response?.data.data;
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

    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật reporter của nhiệm vụ thành công!"
      );
      return response?.data.data;
    }
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

    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật tên nhiệm vụ thành công!"
      );
      return response?.data.data;
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Lỗi khi cập nhật tên task!";
    showErrorToast(message);
    throw error;
  }
};


