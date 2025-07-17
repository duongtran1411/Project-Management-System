"use client";
import Footer from "@/components/homepage/Footer";
import Header from "@/components/homepage/Header";
import React, { useState } from "react";
import { Typography, Button } from "antd";

import ImageAnimation from "@/components/homepage/ImageAnimation";
import { useEffect } from "react";
import { showSuccessToast } from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { useRouter } from "next/navigation";
const { Text } = Typography;
export default function Page() {
  const [name, setName] = useState<string>("");
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string>("");
  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    const justLoggedIn = localStorage.getItem(Constants.API_FIRST_LOGIN);
    if (token && justLoggedIn === "true") {
      setAccessToken(token);
      const decoded = jwtDecode<TokenPayload>(token);
      setName(decoded.fullname);
      showSuccessToast("Đăng nhập thành công!");
      localStorage.removeItem("justLoggedIn");
    } else if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      setName(decoded.fullname);
    }
  }, []);

  const handleContinue = () => {
    if (accessToken) {
      router.push("/workspace");
    } else {
      showSuccessToast("Vui lòng đăng nhập trước khi tiếp tục!");
      router.push("/login");
    }
  };
  return (
    <div className="flex max-h-screen">
      <div className="flex-1 bg-white">
        <div className="fixed left-0 top-0 right-0">
          <Header />
        </div>

        <div className="flex items-center justify-center max-h-screen h-full bg-[#deebfe] p-20 gap-10">
          <div className="flex flex-col justify-center max-h-screen h-full bg-[#deebfe]  ">
            <p className="font-semibold mb-5 max-w-[700px] leading-[1.15] font-charlie text-[44px]">
              Connect every team,
              <br />
              task, and project
              <br />
              together with Project Hub
            </p>
            {accessToken && (
              <div className="mt-8">
                <Text className="text-4xl font-medium mb-2 inline-block relative text-center">
                  Welcome back, {name}
                  <span className="absolute left-0 bottom-0 w-full h-2 bg-[#fde047] rounded-lg -z-10"></span>
                </Text>

                {/* Button Continue */}
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  className="mt-3 px-16 font-semibold text-lg w-[350px] h-12"
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </div>
            )}
          </div>

          <ImageAnimation />
        </div>
        <Footer />
      </div>
    </div>
  );
}
