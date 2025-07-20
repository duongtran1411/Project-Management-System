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
      .post(Endpoints.ProjectContributor.CONFIRM_INVITE(token), token);

    if (response.status === 200) {
      showSuccessToast("Confirm invitation members successfully!");
      return response;
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to confirm invitation member.";
    showErrorToast(message);
    console.log("Confirming Invitation Member Error:", message);
  }
  return null;
};
