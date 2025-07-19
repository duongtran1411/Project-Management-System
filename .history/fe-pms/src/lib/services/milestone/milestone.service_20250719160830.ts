import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { CreateMilestone, Milestone } from "@/models/milestone/milestone.model";

export const updateMilestone = async (milestone: Milestone) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(`${Endpoints.Milestone.MILESTONE}/${milestone._id}`, milestone);

    if (response.status === 200) {
      showSuccessToast("Edit sprint successfully!");
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to edit sprint!");
    }
  }
};

export const deleteMilestone = async (milestoneId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(`${Endpoints.Milestone.MILESTONE}/${milestoneId}`);

    if (response.status === 200) {
      showSuccessToast("Delete sprint successfully!");
      return response.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to delete sprint!");
    }
  }
};

export const createMilestone = async (milestone: CreateMilestone) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Milestone.MILESTONE}`, milestone);

    if (response.status === 201) {
      showSuccessToast("Create sprint successfully!");
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Create to delete sprint!");
    }
  }
};

export const updateStatusMilestone = async (
  milestoneId: string,
  status: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(`${Endpoints.Milestone.UPDATE_STATUS}/${milestoneId}`, { status });
    console.log("response update status", response);
    if (response.status === 200) {
      showSuccessToast(
        response.data?.message || "Cập nhật trạng thái sprint thành công!"
      );
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response.data.message || "Lỗi khi cập nhật trạng thái sprint!"
      );
    }
  }
};
