import { showErrorToast } from "@/components/common/toast/toast"
import axiosService from "../axios.service"
import { Endpoints } from "@/lib/endpoints"

export const removeLog = async (dayRemove: number) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.ActivityLog.DELETED_LOG}`,{
            daysOld: dayRemove
        })

        return response.data
    } catch (error: any) {
        const errorMessage = error?.data?.response?.messsage || error?.message || 'đã có lỗi xảy ra'
        if (errorMessage) {
            showErrorToast(errorMessage)
        }
    }
}
