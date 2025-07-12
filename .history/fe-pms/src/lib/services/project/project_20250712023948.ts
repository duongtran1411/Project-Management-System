import { Project } from "@/types/types";
import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";

export const createProject = async (project: Project) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Project.CREATE_PROJECT}`, project);

    if (response.status === 201) {
      showSuccessToast("Create new project successfully!");
      return response.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response.data.message || "Fail to create project task!"
      );
    }
  }
};
