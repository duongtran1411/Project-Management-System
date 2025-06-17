import axiosService from "@/lib/services/axios.service"
import { Constants } from "@/lib/constants"

const axios = axiosService.getAxiosInstance()



export const axiosFetcher = (url: string) =>
  axios.get(url).then((res) => res.data?.data)

export const logout = () => {
  localStorage.removeItem(Constants.API_TOKEN_KEY)
  window.location.href = "/"
}
