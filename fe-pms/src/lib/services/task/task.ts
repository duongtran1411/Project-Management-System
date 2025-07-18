import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Task, TaskModel } from "@/types/types";

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

export const updateTask = async (taskId: string, task: Task) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(Endpoints.Task.UPDATE_TASK(taskId), task);

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

export const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(Endpoints.Task.UPDATE_TASK(taskId), { status });

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
      error?.response?.data?.message || "Không thể lấy danh sách task được giao!";
    showErrorToast(message);
    return null;
  }
};





