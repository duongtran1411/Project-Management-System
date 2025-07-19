import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";

export const getEpicsByProject = async (projectId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.Epic.GET_BY_PROJECT(projectId));

    return response.data?.data || [];
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to fetch epic!";
    showErrorToast(message);
    return [];
  }
};

export const createEpic = async (epicData: any) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(Endpoints.Epic.CREATE_EPIC, epicData);
    if (response.status === 201) {
      showSuccessToast(response.data?.message || "Tạo epic thành công!");
      return response?.data;
    } else {
      showErrorToast(response.data?.message || "Tạo epic thất bại");
      return null;
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to create epic!";
    showErrorToast(message);
    return null;
  }
};
