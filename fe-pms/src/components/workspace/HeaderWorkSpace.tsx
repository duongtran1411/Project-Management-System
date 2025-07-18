"use client";
import {
  MenuUnfoldOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
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

import { useAuth } from "@/lib/auth/auth-context";
import { logout } from "@/lib/utils";
import NotificationPopup from "./NotificationPopup";

const HeaderWorkSpace = ({ onCollapse }: { onCollapse: () => void }) => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const avatar = userInfo?.avatar?.trim() || undefined;
  const userName = userInfo?.fullname || "";
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "home":
        router.push("/");
        break;
      case "profile":
        router.push("/profile");
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
          {userInfo ? (
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}
              className="header-workspace-dropdown"
            >
              <Space className="cursor-pointer">
                <Avatar src={avatar} />
                <span className="text-gray-700">{userName}</span>
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
