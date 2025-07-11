import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import { showErrorToast } from "@/components/common/toast/toast";
import { ProjectContributor } from "@/types/types"; 



export const getProjectsContributorByUserId = async (
  userId: string
): Promise<ProjectContributor[] | null> => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.ProjectContributor.GET_PROJECTS_BY_USER(userId));

    return response.data?.data || [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to fetch user's projects.";
    showErrorToast(message);
    return null;
  }
};
