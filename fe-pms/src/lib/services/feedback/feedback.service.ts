import { showErrorToast } from "@/components/common/toast/toast";
import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";

export const createFeedback = async (projectContributorId: string, message: string, type: string) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.Feedback.CREATE}`,{
            projectContributorId:projectContributorId,
            message: message,
            type: type
        })
        return response.data
    } catch (error: any) {
        if (error) {
            showErrorToast(error.response.data.message || "Lỗi khi cập nhật sprint!");
        }
    }
}

export const updateFeedback = async (projectId:string, message: string, type: string) => {
    try {
        const response = await axiosService.getAxiosInstance().put(`${Endpoints.Feedback.UPDATE(projectId)}`,{
            message: message,
            type: type
        })
        return response.data
    } catch (error: any) {
        if (error) {
            showErrorToast(error.response.data.message || "Lỗi khi cập nhật sprint!");
        }
    }
}