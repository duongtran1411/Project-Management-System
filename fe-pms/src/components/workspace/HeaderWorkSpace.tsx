"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Avatar,
  Typography,
  MenuProps,
  Dropdown,
  Space,
} from "antd";
import {
  QuestionCircleOutlined,
  SettingOutlined,
  SearchOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { Constants } from "@/lib/constants";

import { logout } from "@/lib/utils";
import NotificationPopup from "./NotificationPopup";

const HeaderWorkSpace = ({ onCollapse }: { onCollapse: () => void }) => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      setAvatar(decoded.avatar);
      setToken(access_token);
    }
  }, []);
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "workspace":
        router.push("/workspace");
        console.log("Go to My Workspace");
        break;
      case "profile":
        router.push("/profile");
        console.log("Go to Profile");
        break;
      case "logout":
        logout();
        console.log("Logging out...");
        break;
    }
  };

  const items: MenuProps["items"] = [
    {
      label: "My Workspace",
      key: "workspace",
    },
    {
      label: "Profile",
      key: "profile",
    },
    {
      type: "divider",
    },
    {
      label: "Logout",
      key: "logout",
    },
  ];
  return (
    <header className="bg-white px-4 py-2 flex items-center justify-between w-full border-b border-gray-300">
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
      <div className="flex  mx-4 gap-[10px] items-center justify-center">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="bg-gray-100 w-[780px] h-[32px]"
        />
        <Button className="bg-[#1868db] text-white">
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
          {token ? (
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}
            >
              <Space className="cursor-pointer">
                <Avatar src={avatar} />
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
