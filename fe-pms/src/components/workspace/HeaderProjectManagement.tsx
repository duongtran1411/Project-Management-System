"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Alert, Image, Menu, Spin } from "antd";
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  TableOutlined,
  CalendarOutlined,
  BarsOutlined,
  UserOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import { Constants } from "@/lib/constants";
import { useRole } from "@/lib/auth/auth-project-context";

const fetcherWithToken = async ([url, token]: [string, string]) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const HeaderProjectManagement = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { role } = useRole();
  const isProjectAdmin = role.name === "PROJECT_ADMIN";
  const isStakeholder = role.name === "STAKEHOLDER";
  const pathname = usePathname();

  // Tính key active từ pathname
  const getKeyFromPath = () => {
    const subpath = pathname.split(`/${projectId}`)[1];
    if (!subpath || subpath === "" || subpath === "/") return "Board";
    if (subpath.includes("summary")) return "Summary";
    if (subpath.includes("timeline")) return "Timeline";
    if (subpath.includes("backlog")) return "Backlog";
    if (subpath.includes("calendar")) return "Calendar";
    if (subpath.includes("list")) return "List";
    if (subpath.includes("time-tracking")) return "Time Tracking";
    if (subpath.includes("user-management")) return "User Management";
    if (subpath.includes("feedback")) return "Feedback";
    return "Board";
  };
  const selectedKey = getKeyFromPath();
  
  const [token, setToken] = useState("");
  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      setToken(access_token);
    }
  }, []);

  const {
    data: projectData,
    error,
    isLoading,
  } = useSWR(
    token
      ? [
          `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Project.GET_BY_ID(
            projectId || ""
          )}`,
          token,
        ]
      : null,
    fetcherWithToken
  );
  const menuItems = [
    {
      key: "Summary",
      label: "Summary",
      icon: <AppstoreOutlined />,
      url: `/workspace/project-management/${projectId}/summary`,
    },
    {
      key: "Timeline",
      label: "Timeline",
      icon: <ClockCircleOutlined />,
      url: `/workspace/project-management/${projectId}/timeline`,
    },

    {
      key: "Backlog",
      label: "Backlog",
      icon: <UnorderedListOutlined />,
      url: `/workspace/project-management/${projectId}/backlog`,
    },
    {
      key: "Board",
      label: "Board",
      icon: <TableOutlined />,
      url: `/workspace/project-management/${projectId}`,
    },
    {
      key: "Calendar",
      label: "Calendar",
      icon: <CalendarOutlined />,
      url: `/workspace/project-management/${projectId}/calendar`,
    },

    {
      key: "List",
      label: "List",
      icon: <BarsOutlined />,
      url: `/workspace/project-management/${projectId}/list`,
    },
    {
      key: "Time Tracking",
      label: "Time Tracking",
      icon: <ClockCircleOutlined />,
      url: `/workspace/project-management/${projectId}/time-tracking`,
    },
    {
      key: "User Management",
      label: "User Management",
      icon: <UserOutlined />,
      url: `/workspace/project-management/${projectId}/user-management`,
    },
    {
      key: "Feedback",
      label: "Feedback",
      icon: <SnippetsOutlined />,
      url: `/workspace/project-management/${projectId}/feedback`,
    },
  ];


  return (
    <div className="w-full px-4 pt-3 bg-white shadow">
      {/* Title */}

      <div className="mb-1">
        <span className="text-xs text-gray-600">Project</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-start gap-2 mb-3 ml-3">
          <Spin size="small" />
          <span className="text-sm text-gray-500">Loading project...</span>
        </div>
      ) : error ? (
        <div className="mb-3 ml-3">
          <Alert
            message="Error"
            description="Failed to load project data."
            type="error"
            showIcon
          />
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Image
              src={projectData?.data?.image || "/project.png"}
              alt="logo"
              // className="ml-3 rounded-sm w-7 h-7"
              width={28}
              height={28}
            />
            <span className="text-base font-bold text-gray-800">
              {projectData?.data?.name || "Project Management"}
            </span>
          </div>
        </div>
      )}

      {/* Menu */}
      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        onClick={(e) => {
          const selectedItem = menuItems.find((item) => item.key === e.key);
          if (selectedItem?.url) {
            router.push(selectedItem.url);
          }
        }}
        className="w-full bg-transparent border-none [&_.ant-menu-item]:pt-[6px] [&_.ant-menu-item]:pb-[10px]"
        overflowedIndicator={null}
        items={menuItems
          .filter((item) => {
            if (
              (item.key === "Time Tracking" ||
                item.key === "User Management") &&
              !isProjectAdmin
            ) {
              return false;
            }

            if (item.key === "Feedback" && (isProjectAdmin || isStakeholder))
              return true;
            return true;
          })
          .map((item) => ({
            key: item.key,
            label: (
              <span className="flex items-center gap-1 pr-1 text-sm font-semibold text-[#505258]">
                {item.icon}
                <span>{item.label}</span>
              </span>
            ),
          }))}
      />
    </div>
  );
};

export default HeaderProjectManagement;
