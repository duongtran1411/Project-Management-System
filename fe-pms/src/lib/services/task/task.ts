import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { TaskModel } from "@/types/types";

export const createTask = async (task: TaskModel) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Task.CREATE_PROJECT}`, task);

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
