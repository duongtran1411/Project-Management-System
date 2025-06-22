"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Constants } from "../constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { isTokenValid } from "@/helpers/auth/checktoken";

interface AuthContextType {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Chỉ chạy một lần khi component mount và không đang redirect
    if (hasCheckedAuth || isRedirecting) {
      return;
    }

    const checkAuth = async () => {
      const token = localStorage.getItem(Constants.API_TOKEN_KEY);
      const currentPath = window.location.pathname;
      
      console.log("AuthProvider - Current path:", currentPath);
      console.log("AuthProvider - Has token:", !!token);
      console.log("AuthProvider - Is redirecting:", isRedirecting);
      
      // Nếu đang ở trang authentication, chỉ cập nhật trạng thái, KHÔNG BAO GIỜ redirect
      if (currentPath.startsWith("/authentication")) {
        console.log("AuthProvider - On authentication page, skipping redirect logic");
        if (token && isTokenValid(token)) {
          console.log("AuthProvider - Valid token found, setting logged in");
          setIsLoggedIn(true);
        } else {
          console.log("AuthProvider - No valid token, setting logged out");
          setIsLoggedIn(false);
          // Xóa token không hợp lệ
          localStorage.removeItem(Constants.API_TOKEN_KEY);
          localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
        }
        setHasCheckedAuth(true);
        return; // Thoát sớm, KHÔNG thực hiện bất kỳ logic redirect nào
      }
      
      // Chỉ thực hiện logic redirect khi KHÔNG ở trang authentication
      console.log("AuthProvider - Not on authentication page, checking redirect logic");
      if (token && isTokenValid(token)) {
        const decoded = jwtDecode<TokenPayload>(token);
        setIsLoggedIn(true);
        
        // Chỉ chuyển hướng nếu đang ở trang không phù hợp với role
        if (decoded.role === "ADMIN" && !currentPath.startsWith("/admin")) {
          console.log("AuthProvider - Redirecting admin to /admin");
          setIsRedirecting(true);
          router.replace("/admin");
        } else if (decoded.role === "USER" && currentPath.startsWith("/admin")) {
          console.log("AuthProvider - Redirecting user to /");
          setIsRedirecting(true);
          router.replace("/");
        }
      } else {
        localStorage.removeItem(Constants.API_TOKEN_KEY);
        localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
        setIsLoggedIn(false);
        
        // Chỉ chuyển hướng về login nếu không phải đang ở trang authentication
        if (!currentPath.startsWith("/authentication")) {
          console.log("AuthProvider - Redirecting to login");
          setIsRedirecting(true);
          router.replace("/authentication/login");
        }
      }
      
      setHasCheckedAuth(true);
    };

    checkAuth();
  }, [hasCheckedAuth, isRedirecting]);

  return (
    <AuthContext.Provider value={{ isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
