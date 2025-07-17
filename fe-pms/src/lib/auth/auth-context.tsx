"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Constants } from "../constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { isTokenValid } from "@/helpers/auth/checktoken";

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: TokenPayload | null;
  loginSuccess: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<TokenPayload | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    const currentPath = window.location.pathname;

    if (currentPath.startsWith("/authentication")) {
      if (token && isTokenValid(token)) {
        setIsLoggedIn(true);
        const decoded = jwtDecode<TokenPayload>(token);
        setUserInfo(decoded);
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
      return;
    }

    if (!token || !isTokenValid(token)) {
      setIsLoggedIn(false);
      localStorage.removeItem(Constants.API_TOKEN_KEY);
      localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
      return;
    }

    setIsLoggedIn(true);
    const decoded = jwtDecode<TokenPayload>(token);
    setUserInfo(decoded);
    if (decoded.role === "USER" && !currentPath.startsWith("/")) {
      router.replace("/");
    }
  }, []);

  const loginSuccess = (token: string) => {
    localStorage.setItem(Constants.API_TOKEN_KEY, token);
    const decoded = jwtDecode<TokenPayload>(token);
    setUserInfo(decoded);
    setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo,loginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
