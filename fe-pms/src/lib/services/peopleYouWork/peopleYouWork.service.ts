import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import { UserModel } from "@/models/user/PeopleYouWork.model";
import { showErrorToast } from "@/components/common/toast/toast";

export const getPeopleYouWorkWithProject = async (
  projectId: string
): Promise<UserModel[] | null> => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.PeopleYouWorkWith.GET_BY_PROJECT(projectId));

    return response.data?.data || [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Không thể lấy danh sách người làm việc cùng!";
    showErrorToast(message);
    return null;
  }
};


export const getAllPeopleYouWorkWith = async (): Promise<UserModel[] | null> => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(Endpoints.PeopleYouWorkWith.GET_ALL);

    return response.data?.data || [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Không thể lấy danh sách người làm việc cùng!";
    showErrorToast(message);
    return null;
  }
};
