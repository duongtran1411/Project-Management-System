import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Project } from "@/models/project/project.model";

export const createProject = async (project: Project) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Project.CREATE_PROJECT}`, project);

    if (response.data.statusCode === 201) {
      showSuccessToast(
        response.data.message || "Create new project successfully!"
      );
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to create project!");
    }
  }
};

export const updateProject = async (projectId: string, project: Project) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(`${Endpoints.Project.UPDATE_PROJECT(projectId)}`, project);

    if (response.data.statusCode === 200) {
      showSuccessToast(response.data.message || "Update project successfully!");
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to update project!");
    }
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(`${Endpoints.Project.DELETE_PROJECT(projectId)}`);

    if (response.data.statusCode === 200) {
      showSuccessToast(response.data.message || "Delete project successfully!");
      return response.data?.data;
    }
    if (response.data.statusCode === 401) {
      showErrorToast(
        response.data.message ||
          "You don't have permission to delete this project!"
      );
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to delete project!");
    }
  }
};

//restore project deleted
export const restoreProject = async (projectId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Project.RESTORE_PROJECT(projectId)}`);

    if (response.status === 200) {
      showSuccessToast(
        response.data.message || "Restore project successfully!"
      );
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(error.response.data.message || "Fail to restore project!");
    }
  }
};
