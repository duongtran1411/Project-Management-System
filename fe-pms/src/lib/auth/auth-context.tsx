"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Constants } from "../constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
interface AuthContextType {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(Constants.API_TOKEN_KEY);

      if (token) {
        const decoded = jwtDecode<TokenPayload>(token);
        setIsLoggedIn(true);
        if (decoded.role === "ADMIN") {
          router.replace("/admin");
        }
        if (decoded.role === "USER") {
          router.replace("/");
        }
      }
      // else {
      //   router.replace("/");
      // }
    };

    checkAuth();
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
