import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { CreateMilestone, Milestone } from "@/types/types";

export const updateMilestone = async (milestone: Milestone) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(`${Endpoints.Milestone.MILESTONE}/${milestone._id}`, milestone);

    if (response.status === 200) {
      showSuccessToast("Edit sprint successfully!");
      return response.data;
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
      return response.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Create to delete sprint!");
    }
  }
};
