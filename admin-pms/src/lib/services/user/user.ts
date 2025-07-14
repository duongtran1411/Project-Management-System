import { Endpoints } from "@/lib/endpoints"
import axiosService from "../axios.service"
import { showErrorToast } from "@/components/common/toast/toast"

export const getAll = async (url:string) => {
    try {
        const response = await axiosService.getAxiosInstance().get(url)
        if(!response.data.success){
            return response.data
        }
        return response.data
    } catch (error:any) {
        const errorMessage = error?.data?.response?.messsage || error?.message || 'đã có lỗi xảy ra'
        if(errorMessage){
            showErrorToast(errorMessage)
        }
    }
}

export const updateStatus = async (id: string, status:string) => {
    try {
        const response = await axiosService.getAxiosInstance().patch(`${Endpoints.User.UPDATE_STATUS(id)}`,{
            status:status
        })
        return response.data
    } catch (error:any) {
        const errorMessage = error?.data?.response?.messsage || error?.message || 'đã có lỗi xảy ra'
        if(errorMessage){
            showErrorToast(errorMessage)
        }
    }
}