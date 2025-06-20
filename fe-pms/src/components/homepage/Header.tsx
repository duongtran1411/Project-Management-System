"use client";
import React from "react";
import { Button, Avatar, Space, Dropdown, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Constants } from "@/lib/constants";
import { useEffect, useState } from "react";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
const Header: React.FC = () => {
  const [token, setToken] = useState("");
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [avatar, setAvatar] = useState<string>('')
  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      setUserName(decoded.fullName)
      setAvatar(decoded.avatar);
      setToken(access_token);
    }
  }, []);
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "workspace":
        router.push('/workspace')
        console.log("Go to My Workspace");
        break;
      case "profile":
        router.push('/profile')
        console.log("Go to Profile");
        break;
      case "logout":
        logout()
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

  const menu = <Menu onClick={handleMenuClick} items={items} />;
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="flex items-center">
        <img src="/jira_icon.png" alt="Logo" className="h-8 w-8" />
        <h1 className="ml-3 text-xl font-semibold text-gray-800">Hub</h1>
      </div>

      <div>
        {token ? (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Space className="cursor-pointer">
              <Avatar src={avatar}/>
              <span className="text-gray-700">{userName}</span>
            </Space>
          </Dropdown>
        ) : (
          <Button type="primary" className="bg-blue-500 hover:bg-blue-600">
            <Link href={"/authentication/login"}>Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
