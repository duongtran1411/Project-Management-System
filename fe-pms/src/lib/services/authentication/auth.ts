import { Endpoints } from "@/lib/endpoints"
import axiosService from "../axios.service"
import { showErrorToast } from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";

export const loginGoogle = async (idToken: string) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.Auth.LOGIN_WITH_GOOGLE}`,{
            idToken
        })
        if(response.status === 200){
            return response.data;
        }
    } catch (error:any) {
        if(error){
            showErrorToast(error.response.data.message || 'Không thể đăng nhập')
        }
    }
}

export const login = async (email: string, password: string) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.Auth.LOGIN}`,{
            email, password
        })

        if(response.data.success){
            return response.data;
        }

        if(!response.data.success){
            return response.data;
        }
    } catch (error:any) {
        if(error){
            showErrorToast(error.response.data.message || 'Không thể đăng nhập')
        }
    }
}

