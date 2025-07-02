"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Constants } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import Spinner from "@/components/common/spinner/spin";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (!token) {
      router.replace("/authentication/login");
      return;
    }
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (decoded.role !== "ADMIN") {
        router.replace("/authentication/login");
      }
    } catch {
      router.replace("/authentication/login");
    }finally{
      setLoading(false)
    }
  }, [router]);

  
   if (loading) {
    return <Spinner />;
  }
}
