'use client';
import { useContext, createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Constants } from "../constants";
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
        setIsLoggedIn(true);
        router.replace("/");
      } else {
        router.replace("/");
      }
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
