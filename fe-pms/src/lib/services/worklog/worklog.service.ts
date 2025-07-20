import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";

import { WorklogModel } from "@/models/worklog/worklog";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";

export const createWorklog = async (worklog: WorklogModel) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Worklog.CREATE_WORKLOG}`, worklog);

    if (response.status === 201) {
      showSuccessToast(
        response.data.message || "Create new worklog successfully!"
      );
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response.data.message || "Fail to create new worklog!"
      );
    }
  }
};

export const updateWorklog = async (
  worklog: WorklogModel,
  worklogId: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(`${Endpoints.Worklog.UPDATE_WORKLOG(worklogId)}`, worklog);

    if (response.status === 200) {
      showSuccessToast(response.data.message || "Update worklog successfully!");
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to update worklog!");
    }
  }
};

export const deleteWorklog = async (worklogId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(`${Endpoints.Worklog.DELETE_WORKLOG(worklogId)}`);

    if (response.status === 200) {
      showSuccessToast(response.data.message || "Delete worklog successfully!");
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to delete worklog!");
    }
  }
};
