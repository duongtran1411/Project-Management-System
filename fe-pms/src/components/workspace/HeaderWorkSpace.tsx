"use client";
import {
  HomeOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
  SelectOutlined,
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
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { logout } from "@/lib/utils";
import { TokenPayload } from "@/models/user/TokenPayload.model";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useOnClickOutside } from "usehooks-ts";
import NotificationPopup from "./NotificationPopup";

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

  const { data: myTasks } = useSWR(
    userId ? `${Endpoints.Task.MY_TASKS}` : null,
    fetcher
  );

  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useOnClickOutside(searchRef, () => {
    setIsSearchFocused(false);
  });

  // Filter tasks based on search text
  const filteredTasks = myTasks?.data?.filter(
    (task: any) =>
      task.name.toLowerCase().includes(searchText.toLowerCase()) ||
      task.projectId.name.toLowerCase().includes(searchText.toLowerCase())
  );

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
      <div className="relative" ref={searchRef}>
        <div className="flex gap-[10px] items-center">
          <div className="relative">
            <Input
              placeholder="Search tasks..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="bg-gray-100 w-[600px] h-[32px]"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            {isSearchFocused && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto p-2">
                {filteredTasks.length > 0 ? (
                  <div className="space-y-2">
                    {filteredTasks.map((task: any) => (
                      <div
                        key={task._id}
                        className="hover:bg-gray-100 cursor-pointer px-4 py-1 flex items-center gap-x-2"
                        onClick={() => {
                          router.push(
                            `/workspace/project-management/${task.projectId._id}/detail-task/${task._id}`
                          );
                          setIsSearchFocused(false);
                        }}
                      >
                        <SelectOutlined
                          className="font-semibold"
                          style={{ color: "#764ba2" }}
                        />
                        <div className="flex flex-col ml-1">
                          <span className="text-sm font-semibold text-gray-700">
                            {task.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {task.projectId.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-gray-500 text-center">
                    <InboxOutlined />
                    <span className="text-xl font-semibold text-gray-700">
                      No tasks found
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <Button
            type="primary"
            className="bg-[#1868db] text-white"
            onClick={() => router.push("/create-project")}
          >
            <PlusOutlined />
            Create
          </Button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-x-4">
        <NotificationPopup />

        <div>
          {user?.data ? (
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}
              className="header-workspace-dropdown"
            >
              <Space className="cursor-pointer">
                {user?.data?.avatar ? (
                  <Avatar src={user?.data?.avatar} />
                ) : (
                  <Avatar className=" cursor-pointer">U</Avatar>
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
