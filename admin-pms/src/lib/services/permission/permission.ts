import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import { showErrorToast } from "@/components/common/toast/toast";

export const addPermission = async (code: string, description: string) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.Permission.ADD_PERMISSION}`,
            {
                code: code,
                description: description
            }
        )

        return response.data;
    } catch (error: any) {
        const errorMessage = error?.data?.response?.messsage || error?.message || 'đã có lỗi xảy ra'
        if (errorMessage) {
            showErrorToast(errorMessage)
        }
    }
}

export const getPermissionById = async (permissionId: string) => {
    try {
        const response = await axiosService.getAxiosInstance().get(`${Endpoints.Permission.GET_PERMISSION_BY_ID(permissionId)}`)

        return response.data;
    } catch (error: any) {
        const errorMessage = error?.data?.response?.messsage || error?.message || 'đã có lỗi xảy ra'
        if (errorMessage) {
            showErrorToast(errorMessage)
        }
    }
}

export const updatePermission = async (permissionId: string, code: string, description: string) => {
    try {
        const response = await axiosService.getAxiosInstance().put(`${Endpoints.Permission.UPDATE_PERMISSION(permissionId)}`, {
            code: code,
            description: description
        })

        return response.data
    } catch (error: any) {
        const errorMessage = error?.data?.response?.messsage || error?.message || 'đã có lỗi xảy ra'
        if (errorMessage) {
            showErrorToast(errorMessage)
        }
    }

}