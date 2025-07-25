"use client";

import { logout } from "@/lib/utils";
import { ClusterOutlined, LogoutOutlined, MailOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, Space } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { FaRegListAlt, FaUserAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getButtonClass = (path: string) => {
    return `flex items-center w-full gap-3 px-3 py-2 rounded-lg ${
      isActive(path)
        ? "bg-violet-50 text-violet-700 font-medium"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  };

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
    <div className="flex h-screen">
      <div className="w-[256px] bg-gray-100">
        <div className="flex flex-col w-64 h-screen bg-white border-r">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-8">
            <img
              src="/Project Hub logo.png"
              alt="Logo"
              className="w-full h-auto"
            />
          </div>
          {/* Main Menu */}
          <div className="px-6 mb-2 text-xs font-semibold text-gray-400">
            MAIN MENU
          </div>
          <nav className="flex-1">
            <ul className="pl-4 pr-4 space-y-1">
              {/* Dashboard */}
              <li>
                <button
                  className={getButtonClass("/admin")}
                  onClick={() => router.push("/admin")}>
                  <MdDashboard />
                  <span className="flex-1 text-left">Dashboard</span>
                </button>
              </li>

              {/* User */}
              <li>
                <button
                  className={getButtonClass("/admin/user")}
                  onClick={() => router.push("/admin/user")}>
                  <FaUserAlt />
                  <span className="flex-1 text-left">User</span>
                </button>
              </li>
              {/* Tasks (dropdown) */}
              <li>
                <button
                  className={getButtonClass("/admin/logsystem")}
                  onClick={() => router.push("/admin/logsystem")}>
                  <FaRegListAlt />
                  <span className="flex-1 text-left">Log System</span>
                </button>
              </li>
              <li>
                <button
                  className={getButtonClass("/admin/permission")}
                  onClick={() => router.push("/admin/permission")}>
                  <ClusterOutlined />
                  <span className="flex-1 text-left">Grant Permission</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[#F3F4F6]">
        {/* Header dùng chung cho mọi trang admin */}
        <div className="flex items-center justify-between px-6 py-4 mb-8 bg-white border-b">
          <div>
            <h1 className="text-2xl font-bold">Admin</h1>
          </div>
          <div className="flex items-center gap-4 pr-8">
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}>
              <Space className="cursor-pointer">
                <Avatar src={'/'} />
                <span className="text-gray-700">Admin</span>
              </Space>
            </Dropdown>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
