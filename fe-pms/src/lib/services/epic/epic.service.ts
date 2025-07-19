import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import { showErrorToast } from "@/components/common/toast/toast";

export const getEpicsByProject = async (projectId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.Epic.GET_BY_PROJECT(projectId));

    return response.data?.data || [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to fetch epic!";
    showErrorToast(message);
    return [];
  }
};


export const updateEpic = async (epicId: string, data: { name: string }) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(Endpoints.Epic.UPDATE_EPIC(epicId), data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to update epic!";
    showErrorToast(message);
    throw error;
  }
};

