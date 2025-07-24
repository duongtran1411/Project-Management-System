"use client";
import { useAuth } from "@/lib/auth/auth-context";
import { logout } from "@/lib/utils";
import { Avatar, Button, Dropdown, MenuProps, Space } from "antd";
import { UserOutlined, LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axiosService from "@/lib/services/axios.service";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const Header: React.FC = () => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: user } = useSWR(
    userInfo?.userId ? `${Endpoints.User.GET_BY_ID(userInfo?.userId)}` : null,
    fetcher
  );

  console.log("user", user);

  // Theo dõi scroll để thêm hiệu ứng
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "workspace":
        router.push("/workspace");
        break;
      case "profile":
        router.push("/workspace/profile");
        break;
      case "logout":
        logout();
        break;
    }
  };

  const items: MenuProps["items"] = [
    {
      label: "My Workspace",
      key: "workspace",
      icon: <HomeOutlined />,
    },
    {
      label: "Profile",
      key: "profile",
      icon: <UserOutlined />,
    },
    {
      type: "divider",
    },
    {
      label: "Logout",
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
          : "bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 w-full">
        <div className="flex items-center">
          <img src="/jira_icon.png" alt="Logo" className="h-8 w-8" />
          <h1 className="ml-3 text-xl font-semibold text-gray-800">Hub</h1>
        </div>

        <div>
          {user?.data ? (
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}
            >
              <Space className="cursor-pointer">
                {user?.data?.avatar ? (
                  <Avatar src={user?.data?.avatar} />
                ) : (
                  <Avatar>U</Avatar>
                )}

                <span className="text-gray-700">{user?.data?.fullName}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0"
            >
              <Link href={"/authentication/login"}>Get Started</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
