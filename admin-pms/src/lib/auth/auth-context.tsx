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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    const currentPath = window.location.pathname;

    if (currentPath.startsWith("/authentication")) {
      if (token && isTokenValid(token)) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }

    if (!token || !isTokenValid(token)) {
      setIsLoggedIn(false);
      localStorage.removeItem(Constants.API_TOKEN_KEY);
      localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
      router.replace("/authentication/login");
      return;
    }

    setIsLoggedIn(true);
   
    
    const decoded = jwtDecode<TokenPayload>(token);
    if (decoded.role !== "ADMIN") {
      router.replace("/authentication/login");
      return;
    }

    if (decoded.role === "ADMIN" && !currentPath.startsWith('/admin')) {
      router.replace("/admin");
      return;
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
