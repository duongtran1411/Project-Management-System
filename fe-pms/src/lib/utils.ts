
import { Constants } from "@/lib/constants"



export const logout = () => {
  localStorage.removeItem(Constants.API_TOKEN_KEY);
  localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
  window.location.href = "/"
}
