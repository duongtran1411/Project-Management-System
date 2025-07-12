"use client";

import { ClusterOutlined, MailOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import {
  FaRegListAlt,
  FaUserAlt
} from "react-icons/fa";
import { HiOutlineChevronDown } from "react-icons/hi";
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

  return (
    <div className="flex h-screen">
      <div className="w-[256px] bg-gray-100">
        <div className="flex flex-col w-64 h-screen bg-white border-r">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-8">
            <img
              src="https://demo.nextadmin.co/_next/static/media/main.31abb9ac.svg"
              alt="Logo"
              className="w-32 h-auto"
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
                  onClick={() => router.push("/admin")}
                  >
                  <MdDashboard />
                  <span className="flex-1 text-left">Dashboard</span>
                  <HiOutlineChevronDown />
                </button>
              </li>

              {/* User */}
              <li >
                <button
                  className={getButtonClass("/admin/user")}
                  onClick={() => router.push("/admin/user")}
                  >
                  <FaUserAlt />
                  <span className="flex-1 text-left">User</span>
                </button>
              </li>
              {/* Calendar */}
              <li >
                <button
                  className={getButtonClass("/admin/emailtemplate")}
                  onClick={() => router.push("/admin/emailtemplate")}
                  >
                  <MailOutlined />
                  <span className="flex-1 text-left">Email Template</span>
                </button>
              </li>
              {/* Tasks (dropdown) */}
              <li>
                <button
                  className={getButtonClass("/admin/logsystem")}
                  onClick={() => router.push("/admin/logsystem")}
                  >
                  <FaRegListAlt />
                  <span className="flex-1 text-left">Log System</span>
                </button>
              </li>
              <li>
                <button
                  className={getButtonClass("/admin/permission")}
                  onClick={() => router.push("/admin/permission")}
                  >
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
            <input className="px-6 py-2 border w-[300px] rounded-3xl bg-[#F3F4F6]" placeholder="Search" />
          </div>
        </div>
        {children}
      </div>
    </div>
    
  );
}
