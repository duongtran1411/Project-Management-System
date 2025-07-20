"use client";

import { BarsOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import Link from "next/link";

const items: MenuProps["items"] = [
  {
    label: <Link href="/workspace/foryou">For you</Link>,
    key: "foryou",
    icon: <UserOutlined />,
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
