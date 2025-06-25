"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "antd";
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  TableOutlined,
  CalendarOutlined,
  BarsOutlined,
  FormOutlined,
  FlagOutlined,
  CheckSquareOutlined,
  CodeOutlined,
} from "@ant-design/icons";

const menuItems = [
    { key: "Summary", label: "Summary", icon: <AppstoreOutlined /> },
    { key: "Timeline", label: "Timeline", icon: <ClockCircleOutlined /> },
    { key: "Backlog", label: "Backlog", icon: <UnorderedListOutlined />, url: '/workspace/project-management/backlog' },
    { key: "Board", label: "Board", icon: <TableOutlined />, url: '/workspace/project-management/board' },
    { key: "Calendar", label: "Calendar", icon: <CalendarOutlined /> },
    { key: "List", label: "List", icon: <BarsOutlined /> },
    { key: "Forms", label: "Forms", icon: <FormOutlined /> },
    { key: "Goals", label: "Goals", icon: <FlagOutlined /> },
    { key: "All work", label: "All work", icon: <CheckSquareOutlined /> },
    { key: "Code", label: "Code", icon: <CodeOutlined /> },
];

const HeaderProjectManagement = () => {
  const [selectedKey, setSelectedKey] = useState("Board");
  const router = useRouter();

  return (
    <div className="w-full px-4 pt-3 bg-white shadow">
      {/* Title */}
      <div className="mb-1">
        <span className="text-xs text-gray-600">Project</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="mr-2 text-xl">📊</span>
          <span className="text-base font-bold text-gray-800">
            Project Management
          </span>
        </div>
      </div>

            {/* Menu */}
            <Menu
                mode="horizontal"
                selectedKeys={[selectedKey]}
                onClick={(e) => {
                    setSelectedKey(e.key);
                    const selectedItem = menuItems.find(item => item.key === e.key);
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
