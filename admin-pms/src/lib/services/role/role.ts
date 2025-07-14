import { showErrorToast } from "@/components/common/toast/toast"
import axiosService from "../axios.service"
import { Endpoints } from "@/lib/endpoints"

export const addPermissionForRole = async (roleId: string, permissionIds: string[], token: string) => {
    try {
        const response = await axiosService.getAxiosInstance().patch(`${Endpoints.Role.UPDATE_PERMISSION(roleId)}`,
            { permissionIds: permissionIds },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
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

export const addRole = async (name: string, description: string) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.Role.ADD_ROLE}`,
            {
                name: name,
                description: description
            },
            // {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     },
            // }
        )

        return response.data;
    } catch (error: any) {
        const errorMessage = error?.data?.response?.messsage || error?.message || 'đã có lỗi xảy ra'
        if (errorMessage) {
            showErrorToast(errorMessage)
        }
    }
}