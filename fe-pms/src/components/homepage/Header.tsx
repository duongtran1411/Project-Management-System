"use client";
import React from "react";
import { Button, Avatar, Space, Dropdown } from "antd";
import { Constants } from "@/lib/constants";
import { useEffect, useState } from "react";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { useAuth } from "@/lib/auth/auth-context";
const Header: React.FC = () => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const avatar = userInfo?.avatar?.trim() || undefined;
  const userName = userInfo?.fullname || "";
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
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="flex items-center ">
        <img src="/jira_icon.png" alt="Logo" className="h-8 w-8" />
        <h1 className="ml-3 text-xl font-semibold text-gray-800">Hub</h1>
      </div>

      <div>
        {userInfo ? (
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}>
            <Space className="cursor-pointer">
              <Avatar src={avatar} />
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
