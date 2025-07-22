import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { InviteMultiple } from "@/types/types";
import { Project } from "@/models/project/project.model";

//get list project by userId
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

//invite many people to come in project
export const inviteMemberMultiple = async (members: InviteMultiple) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(Endpoints.ProjectContributor.INVITE_MULTIPLE, members);

    if (response.data.statusCode === 201) {
      return response.data?.data;
    }
  } catch (error: any) {
    if (
      error?.response?.data?.data?.errors &&
      error.response?.data?.data?.errors.length > 0
    ) {
      error.response.data.data.errors.forEach(
        (err: { email: string; error: string }) => {
          showErrorToast(`Email ${err.email}: ${err.error}`);
        }
      );
    }
  }
  return null;
};

//Confirm invitation
export const confirmInvite = async (token: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .post(Endpoints.ProjectContributor.CONFIRM_INVITE(token));

    if (response.status === 200) {
      showSuccessToast(
        response?.data?.message || "Confirm invitation members successfully!"
      );
      return response.data?.data;
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to confirm invitation member.";
    showErrorToast(message);
    console.log("Confirming Invitation Member Error:", message);
  }
  return null;
};

export const getContributorsByProjectId = async (projectId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.ProjectContributor.GET_CONTRIBUTOR_BY_PROJECT(projectId));

    return response.data?.data || [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Failed to fetch contributors of the project.";
    showErrorToast(message);
    return null;
  }
};

//Remove contributor
export const deleteContributor = async (contributorId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(Endpoints.ProjectContributor.DELETE_CONTRIBUTOR(contributorId));

    if (response.status === 200) {
      showSuccessToast("Remove contributors of the project successfully!");
      return response;
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Failed to remove contributors of the project.";
    setTimeout(() => {
      showErrorToast(message);
    }, 2000);
    return null;
  }
};

//Update project role
export const updateProjectRole = async (
  contributorId: string,
  projectRoleId: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(Endpoints.ProjectContributor.UPDATE_PROJECT_ROLE(contributorId), {
        projectRoleId,
      });

    if (response.status === 200) {
      showSuccessToast(
        response.data.message || "Update project role successfully!"
      );
      return response;
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to update project role.";
    showErrorToast(message);
    return null;
  }
};

//Change project lead
export const changeProjectLead = async (
  projectId: string,
  currentLeadId: string,
  newLeadId: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .put(Endpoints.ProjectContributor.CHANGE_PROJECT_LEAD(projectId), {
        currentLeadId,
        newLeadId,
      });

    if (response.status === 200) {
      showSuccessToast(
        response.data.message || "Change project lead successfully!"
      );
      return response;
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to change project lead.";
    showErrorToast(message);
    return null;
  }
};
