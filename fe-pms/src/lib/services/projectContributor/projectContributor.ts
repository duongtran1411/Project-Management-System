import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import { showErrorToast } from "@/components/common/toast/toast";
import { Project, ProjectContributor } from "@/types/types";

export const getProjectsContributorByUserId = async (
  userId: string
): Promise<Project[] | null> => {
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

export const createProjectContributor = async (
  projectContributor: ProjectContributor
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(
        Endpoints.ProjectContributor.CREATE_PROJECT_CONTRIBUTOR,
        projectContributor
      );

    if (response.status === 201) {
      return response.data?.data;
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to create project contributor.";
    // showErrorToast(message);
    console.log("Create Project Contributor Error:", message);
  }
  return null;
};
