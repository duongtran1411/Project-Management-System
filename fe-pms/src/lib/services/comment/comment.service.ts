import { showErrorToast } from "@/components/common/toast/toast";
import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";

export const createComment = async (content: string,taskId:string) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.Comment.CREATE_COMMENT}`,{
            content:content,
            taskId:taskId
        })
        return response.data
    } catch (error: any) {
        if (error) {
            showErrorToast(error.response.data.message || "Fail to edit sprint!");
        }
    }
}