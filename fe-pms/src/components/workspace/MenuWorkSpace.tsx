"use client";

import {
  ClockCircleOutlined,
  ProfileOutlined,
  RocketOutlined,
  FilterOutlined,
  DashboardOutlined,
  TeamOutlined,
  PictureOutlined,
  AimOutlined,
  UserOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";

const items: MenuProps["items"] = [
  {
    label: "For you",
    key: "foryou",
    icon: <UserOutlined />,
  },
  {
    label: "Recent",
    key: "recent",
    icon: <ClockCircleOutlined />,
  },

  {
    label: "Plans",
    key: "plans",
    icon: <ProfileOutlined />,
  },

  {
    label: "Projects",
    key: "projects",
    icon: <RocketOutlined />,
    children: [
      {
        key: "recent-projects",
        label: <span>📊 Project Management</span>,
      },
      {
        label: (
          <Link href="/workspace/viewall" className="flex items-center gap-2">
            View all projects
          </Link>
        ),
        key: "view-all",
        icon: <BarsOutlined />,
      },
    ],
  },

  {
    label: "Filters",
    key: "filters",
    icon: <FilterOutlined />,
  },
  {
    label: "Dashboards",
    key: "dashboards",
    icon: <DashboardOutlined />,
  },
  {
    label: "Teams",
    key: "teams",
    icon: <TeamOutlined />,
  },
  {
    label: (
      <Link href="#" className="flex justify-between items-center">
        <span>Assets</span> <span>↗</span>
      </Link>
    ),
    key: "assets",
    icon: <PictureOutlined />,
  },
  {
    label: (
      <Link href="#" className="flex justify-between items-center">
        <span>Goals</span> <span>↗</span>
      </Link>
    ),
    key: "goals",
    icon: <AimOutlined />,
  },
];

const MenuWorkSpace = ({ colapsed }: { colapsed: boolean }) => {
  return (
    <div
      className={`min-h-screen bg-white shadow p-2  border-r border-gray-300 ${
        colapsed ? "w-max" : "w-64"
      } transition-all duration-300`}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["foryou"]}
        style={{ borderRight: 0 }}
        items={items}
        inlineCollapsed={colapsed}
      />
    </div>
  );
};

export default MenuWorkSpace;
