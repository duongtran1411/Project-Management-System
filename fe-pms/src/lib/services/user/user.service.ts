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

export const updateUser = async (
  id: string,
  data: Partial<{
    fullName: string;
    email: string;
    avatar: string;
    phone: string;
  }>
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.User.UPDATE(id), data);

    if (response?.data.success) {
      showSuccessToast("Cập nhật thông tin người dùng thành công");
      return response?.data?.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật thất bại");
    }
  } catch (error: any) {
    const errorMessage =
      error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
    if (errorMessage) {
      showErrorToast(errorMessage);
    }
    throw error;
  }
};
