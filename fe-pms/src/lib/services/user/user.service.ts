import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";

export const getAll = async (url: string) => {
  try {
    const response = await axiosService.getAxiosInstance().get(url);
    if (!response.data.success) {
      return response.data;
    }
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
    if (errorMessage) {
      showErrorToast(errorMessage);
    }
  }
};

export const updateProfile = async (userId: string, formData: any) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(Endpoints.User.UPDATE(userId), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    if (response.status === 200) {
      showSuccessToast(response.data.message || "Update profile successfully!");
      return response;
    } else {
      throw new Error(response.data?.message || "Update profile failed!");
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Fail to update profile!";
    showErrorToast(errorMessage);
    throw error;
  }
};
