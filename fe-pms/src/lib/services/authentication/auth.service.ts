import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";

export const loginGoogle = async (idToken: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Auth.LOGIN_WITH_GOOGLE}`, {
        idToken,
      });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Không thể đăng nhập");
    }
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Auth.LOGIN}`, {
        email,
        password,
      });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.code === "ERR_BAD_REQUEST") {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Đăng nhập thất bại",
      };
    }

    return {
      success: false,
      message: error?.message || "Đã xảy ra lỗi không xác định",
    };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Auth.FORGOT_PASSWORD}`, {
        email,
      });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if (error?.response?.status === 400 || error?.code === "ERR_BAD_REQUEST") {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Đăng nhập thất bại",
      };
    }

    return {
      success: false,
      message: error?.message || "Đã xảy ra lỗi không xác định",
    };
  }
};

export const changePassword = async (data: any) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(Endpoints.Auth.CHANGE_PASSWORD, data);

    if (response.status == 200) {
      showSuccessToast(response.data.message);
      return;
    }
    return;
  } catch (error: any) {
    const errorMessage =
      error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
    if (errorMessage) {
      showErrorToast(errorMessage);
    }
  }
};
