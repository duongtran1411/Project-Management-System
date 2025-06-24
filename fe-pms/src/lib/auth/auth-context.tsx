"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Constants } from "../constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { isTokenValid } from "@/helpers/auth/checktoken";
import { logout } from "../utils";

interface AuthContextType {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    const currentPath = window.location.pathname;

   
    if (currentPath.startsWith("/authentication")) {
      if (token && isTokenValid(token)) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem(Constants.API_TOKEN_KEY);
        localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
      }
    }

   
    if (!token || !isTokenValid(token)) {
      console.log("path", currentPath);
      setIsLoggedIn(false);
      localStorage.removeItem(Constants.API_TOKEN_KEY);
      localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);

      return
    }

    setIsLoggedIn(true);
    const decoded = jwtDecode<TokenPayload>(token);
    if (decoded.role === "ADMIN" && !currentPath.startsWith("/admin")) {
      router.replace("/admin");
    }
    if (decoded.role === "USER") {
      router.replace("/");
    }

  }, []);

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
