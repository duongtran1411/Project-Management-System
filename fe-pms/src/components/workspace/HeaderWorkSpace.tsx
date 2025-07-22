"use client";
import {
  HomeOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  MenuProps,
  Space,
  Typography,
} from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Constants } from "@/lib/constants";
import { logout } from "@/lib/utils";
import { TokenPayload } from "@/models/user/TokenPayload.model";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import NotificationPopup from "./NotificationPopup";
import axiosService from "@/lib/services/axios.service";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const HeaderWorkSpace = ({ onCollapse }: { onCollapse: () => void }) => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { data: user } = useSWR(
    userId ? `${Endpoints.User.GET_BY_ID(userId)}` : null,
    fetcher
  );

  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      if (decoded) {
        setUserId(decoded.userId);
      }
    }
  }, []);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "home":
        router.push("/");
        break;
      case "profile":
        router.push(`/workspace/profile`);
        break;
      case "logout":
        logout();
        break;
    }
  };

  const items: MenuProps["items"] = [
    {
      label: "Home",
      key: "home",
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
      className="bg-white px-4 py-2 flex items-center justify-between w-full border-b border-gray-300"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-x-3">
        <Button
          type="text"
          icon={<MenuUnfoldOutlined className="text-xl text-gray-600" />}
          onClick={onCollapse}
        />
        <div
          className="flex items-center gap-x-1 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image src="/jira_icon.png" alt="Jira Logo" width={24} height={24} />
          <Typography.Text strong className="text-xl font-semibold">
            Hub
          </Typography.Text>
        </div>
      </div>

      {/* Center */}
      <div className="flex ml-9  mx-4 gap-[10px] items-center justify-center">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="bg-gray-100 w-[600px] h-[32px]"
        />
        <Button
          className="bg-[#1868db] text-white"
          onClick={() => router.push("/create-project")}
        >
          <PlusOutlined />
          Create
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-x-4">
        <NotificationPopup />
        <QuestionCircleOutlined className="text-lg text-gray-600" />
        <SettingOutlined className="text-lg text-gray-600" />

        <div>
          {userId ? (
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}
              className="header-workspace-dropdown"
            >
              <Space className="cursor-pointer">
                {user?.data?.avatar ? (
                  <Avatar src={user?.data?.avatar} />
                ) : (
                  <Avatar className="bg-gray-600 cursor-pointer">U</Avatar>
                )}
                <span className="text-gray-700">{user?.data?.fullName}</span>
              </Space>
            </Dropdown>
          ) : (
            <Avatar className="bg-gray-600 cursor-pointer">U</Avatar>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderWorkSpace;
