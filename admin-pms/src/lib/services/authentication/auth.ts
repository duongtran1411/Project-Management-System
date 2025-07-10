import { Endpoints } from "@/lib/endpoints"
import axiosService from "../axios.service"

export const login = async (email: string, password: string) => {
    try {
        const response = await axiosService.getAxiosInstance().post(`${Endpoints.Auth.LOGIN_ADMIN}`, {
            email, password
        })
        if (response.status === 200) {

            return response.data;
        }
    } catch (error: any) {
        if (error?.response?.status === 401 || error?.code === "ERR_BAD_REQUEST") {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Đăng nhập thất bại",
            };
        }

        return {
            success: false,
            message: error?.message || "Đã xảy ra lỗi không xác định",
        };
    }
}

