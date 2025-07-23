"use client";

import {
  BarsOutlined,
  FilterOutlined,
  RocketOutlined,
  SearchOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Spin, Image } from "antd";
import Link from "next/link";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Constants } from "@/lib/constants";
import { TokenPayload } from "@/models/user/TokenPayload.model";

interface Project {
  _id: string;
  name: string;
  icon: string;
}

const MenuWorkSpace = ({ colapsed }: { colapsed: boolean }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuProps["items"]>([]);

  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (token) {
      const decoded: TokenPayload = jwtDecode(token);
      setUserId(decoded.userId);
    }
  }, []);

  const fetcher = (url: string) =>
    axiosService
      .getAxiosInstance()
      .get(url)
      .then((res) => res.data);

  const { data: projectList, isLoading } = useSWR(
    userId ? Endpoints.ProjectContributor.GET_PROJECTS_BY_USER(userId) : null,
    fetcher
  );

  useEffect(() => {
    const baseItems: MenuProps["items"] = [
      {
        label: <Link href="/workspace/foryou">For you</Link>,
        key: "foryou",
        icon: <UserOutlined />,
      },
      {
        label: "Projects",
        key: "projects",
        icon: <RocketOutlined />,
        children:
          projectList?.data.map((project: Project) => ({
            key: project._id,
            label: (
              <Link
                href={`/workspace/project-management/${project._id}`}
                className="flex items-center gap-2"
              >
                <Image
                  src={project.icon || "/project.png"}
                  alt={project.name}
                  width={18}
                  height={18}
                  preview={false}
                />
                <span>{project.name}</span>
              </Link>
            ),
          })) || [],
      },
      {
        label: (
          <Link href="/workspace/viewall" className="flex items-center gap-2">
            View all projects
          </Link>
        ),
        key: "view-all-projects",
        icon: <UnorderedListOutlined />,
      },
      {
        label: "Filters",
        key: "filters",
        icon: <FilterOutlined />,
        children: [
          {
            label: <Link href="/workspace/filters/search-work-items">Search work items</Link>,
            key: "search-work-items",
            icon: <SearchOutlined />,
          },
          {
            label: "Default filters",
            key: "default-filters",
            icon: <BarsOutlined />,
            children: [
              {
                label: "My open issues",
                key: "my-open-issues",
                icon: <BarsOutlined />,
              },
              {
                label: "Reported by me",
                key: "reported-by-me",
                icon: <BarsOutlined />,
              },
              {
                label: "All issues",
                key: "all-issues",
                icon: <BarsOutlined />,
              },
              {
                label: "Open issues",
                key: "open-issues",
                icon: <BarsOutlined />,
              },
              {
                label: "Done issues",
                key: "done-issues",
                icon: <BarsOutlined />,
              },
            ],
          },
        ],
      },

      {
        label: (
          <Link href="/workspace/teams" className="flex items-center gap-2">
            Teams
          </Link>
        ),
        key: "teams",
        icon: <TeamOutlined />,
      },
    ];

    if (isLoading) {
      const viewAllItem = baseItems.find((item) => item?.key === "view-all");
      if (viewAllItem && "children" in viewAllItem) {
        viewAllItem.children = [
          {
            key: "loading",
            label: <Spin size="small" />,
            disabled: true,
          },
        ];
      }
    }

    setMenuItems(baseItems);
  }, [projectList, isLoading]);

  return (
    <div
      className={`min-h-screen bg-white shadow p-2  border-r border-gray-300 ${colapsed ? "w-max" : "w-64"
        } transition-all duration-300`}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["view-all-projects"]}
        style={{ borderRight: 0 }}
        items={menuItems}
        inlineCollapsed={colapsed}
      />
    </div>
  );
};

export default MenuWorkSpace;
