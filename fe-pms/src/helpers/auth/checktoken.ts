import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload.model";
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};
