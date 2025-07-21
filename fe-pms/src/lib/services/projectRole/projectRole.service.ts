import { showErrorToast } from "@/components/common/toast/toast";
import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";

export const getRoleByProjectId = async (projectId: string) => {
    try {
        const response = await axiosService.getAxiosInstance().get(`${Endpoints.ProjectContributor.GET_ROLE_PROJECT_ID(projectId)}`)
        return response.data
    } catch (error: any) {
        const message =
            error?.response?.data?.message || "Failed to fetch user's projects.";
        showErrorToast(message);
        return null;
    }
}