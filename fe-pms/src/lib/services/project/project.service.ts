import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";
import { showErrorToast } from "@/components/common/toast/toast";
import { Project } from "@/models/project/project.model";

export const createProject = async (project: Project) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Project.CREATE_PROJECT}`, project);

    if (response.status === 201) {
      // showSuccessToast("Create new project successfully!");
      return response.data?.data;
    }
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response.data.message || "Fail to create project task!"
      );
    }
  }
};
