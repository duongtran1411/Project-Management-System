"use client";

import {
  ClockCircleOutlined,
  ProfileOutlined,
  FilterOutlined,
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";

const items: MenuProps["items"] = [
  {
    label: <Link href="/workspace/foryou">For you</Link>,
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
    label: (
      <Link href="/workspace/viewall" className="flex items-center gap-2">
        View all projects
      </Link>
    ),
    key: "view-all",
    icon: <BarsOutlined />,
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
    label: (
      <Link href="/workspace/teams" className="flex items-center gap-2">
        Teams
      </Link>
    ),
    key: "teams",
    icon: <TeamOutlined />,
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
        defaultSelectedKeys={["view-all"]}
        style={{ borderRight: 0 }}
        items={items}
        inlineCollapsed={colapsed}
      />
    </div>
  );
};

export default MenuWorkSpace;
