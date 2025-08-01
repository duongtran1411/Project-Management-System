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

export const updateEpic = async (epicId: string, data: { name: string }) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(Endpoints.Epic.UPDATE_EPIC(epicId), data);
    if (response.status === 200) {
      showSuccessToast(response.data?.message || "Cập nhật epic thành công!");
      return response?.data;
    } else {
      showErrorToast(response.data?.message || "Cập nhật epic thất bại");
      return null;
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to update epic!";
    showErrorToast(message);
    throw error;
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

export const deleteEpic = async (epicId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(Endpoints.Epic.DELETE_EPIC(epicId));
    if (response.status === 200) {
      showSuccessToast(response.data?.message || "Xóa epic thành công!");
      return response?.data;
    } else {
      showErrorToast(response.data?.message || "Xóa epic thất bại");
      return null;
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to delete epic!";
    showErrorToast(message);
    throw error;
  }
};
