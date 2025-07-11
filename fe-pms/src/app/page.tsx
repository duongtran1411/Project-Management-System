"use client";
import Footer from "@/components/homepage/Footer";
import Header from "@/components/homepage/Header";
import React, { useState } from "react";
import { Typography, Input, Button, Space } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import ImageAnimation from "@/components/homepage/ImageAnimation";
import { useEffect } from "react";
import { showSuccessToast } from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { useRouter } from "next/navigation";
const { Text } = Typography;
export default function Page() {
  const [site, setSite] = useState("fpt-team-mdoh239h");
  const [name, setName] = useState<string>("");
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    const justLoggedIn = localStorage.getItem(Constants.API_FIRST_LOGIN);
    if (token && justLoggedIn === "true") {
      const decoded = jwtDecode<TokenPayload>(token);
      setName(decoded.fullname);
      showSuccessToast("Đăng nhập thành công!");
      localStorage.removeItem("justLoggedIn");
    } else if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      setName(decoded.fullname);
    }
  }, []);
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen h-full bg-[#deebfe] p-1 gap-10">
          <div className="flex flex-col justify-center min-h-screen h-full bg-[#deebfe]  ">
            <p className="font-semibold mb-5 max-w-[700px] leading-[1.15] font-charlie text-[44px]">
              Connect every team,
              <br />
              task, and project
              <br />
              together with Project Hub
            </p>
            <div className="mt-8">
              <Text className="text-4xl font-medium mb-2 inline-block relative text-center">
                Welcome back, {name}
                <span className="absolute left-0 bottom-0 w-full h-2 bg-[#fde047] rounded-lg -z-10"></span>
              </Text>
              <div className="mt-4 mb-2">
                <label
                  htmlFor="site-input"
                  className="text-gray-700 text-sm mb-1 block"
                >
                  Your site
                </label>
                <Space.Compact className="w-[350px] h-12">
                  <Input
                    id="site-input"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    suffix={
                      <span className="flex items-center gap-2">
                        <Text className="text-[#7a869a] text-sm">.com</Text>
                        <CheckCircleOutlined className="text-[#36b37e] text-lg font-semibold" />
                      </span>
                    }
                    className="rounded-full text-base bg-white text-[#172b4d] font-['Charlie'] border-2 border-[#36b37e]"
                  />
                </Space.Compact>
              </div>
              <Button
                type="primary"
                size="large"
                shape="round"
                className="mt-3 px-16 font-semibold text-lg w-[350px] h-12"
                onClick={() => router.push("/workspace")}
              >
                Continue
              </Button>
            </div>
          </div>

          <ImageAnimation />
        </div>
        <Footer />
      </div>
    </div>
  );
}
