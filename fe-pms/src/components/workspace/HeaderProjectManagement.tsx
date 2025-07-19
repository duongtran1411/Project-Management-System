"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Image, Menu, Spin } from "antd";
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  TableOutlined,
  CalendarOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import { Constants } from "@/lib/constants";

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
  const [selectedKey, setSelectedKey] = useState("Board");
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
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
          setSelectedKey(e.key);
          const selectedItem = menuItems.find((item) => item.key === e.key);
          if (selectedItem?.url) {
            router.push(selectedItem.url);
          }
        }}
        className="w-full bg-transparent border-none [&_.ant-menu-item]:pt-[6px] [&_.ant-menu-item]:pb-[10px]"
        overflowedIndicator={null}
        items={menuItems.map((item) => ({
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
