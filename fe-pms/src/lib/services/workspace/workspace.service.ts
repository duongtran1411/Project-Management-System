import { showErrorToast, showSuccessToast } from "@/components/common/toast/toast";
import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";

export const initWorkspace = async (name: string, description: string | null) => {
    try {
        const response = await axiosService
            .getAxiosInstance()
            .post(`${Endpoints.Workspace.CREATE}`, {
                name: name,
                description: description
            });
        return response.data
    } catch (error: any) {
        if (error) {
            showErrorToast(
                error.response.data.message || "Fail to create new worklog!"
            );
        }
    }
}