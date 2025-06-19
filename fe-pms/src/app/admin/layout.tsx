"use client";

import { usePathname, useRouter } from "next/navigation";
import { FaRegCalendarAlt, FaRegListAlt, FaTable, FaUserAlt, FaWpforms } from 'react-icons/fa';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getButtonClass = (path: string) => {
    return `flex items-center w-full gap-3 px-3 py-2 rounded-lg ${isActive(path)
      ? 'bg-violet-50 text-violet-700 font-medium'
      : 'text-gray-700 hover:bg-gray-100'
      }`;
  };

  return (
    <div className="flex h-screen">
      <div className="w-[256px] bg-gray-100">
        <div className="flex flex-col w-64 h-screen bg-white border-r">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-8">
            <img src="https://demo.nextadmin.co/_next/static/media/main.31abb9ac.svg" alt="Logo" className="w-32 h-auto" />
          </div>
          {/* Main Menu */}
          <div className="px-6 mb-2 text-xs font-semibold text-gray-400">MAIN MENU</div>
          <nav className="flex-1">
            <ul className="pl-4 pr-4 space-y-1">
              {/* Dashboard */}
              <li>
                <button className={getButtonClass("/admin")} onClick={() => router.push("/admin")}>
                  <MdDashboard />
                  <span className="flex-1 text-left">Dashboard</span>
                  <HiOutlineChevronDown />
                </button>
              </li>

              {/* User */}
              <li>
                <button className={getButtonClass("/admin/user")} onClick={() => router.push("/admin/user")}>
                  <FaUserAlt />
                  <span className="flex-1 text-left">User</span>
                </button>
              </li>
              {/* Calendar */}
              <li>
                <button className={getButtonClass("/admin/calendar")} onClick={() => router.push("/admin/calendar")}>
                  <FaRegCalendarAlt />
                  <span className="flex-1 text-left">Calendar</span>
                </button>
              </li>
              {/* Tasks (dropdown) */}
              <li>
                <button className={getButtonClass("/admin/tasks")} onClick={() => router.push("/admin/tasks")}>
                  <FaRegListAlt />
                  <span className="flex-1 text-left">Tasks</span>
                  <HiOutlineChevronDown />
                </button>
              </li>
              {/* Forms (dropdown) */}
              <li>
                <button className={getButtonClass("/admin/forms")} onClick={() => router.push("/admin/forms")}>
                  <FaWpforms />
                  <span className="flex-1 text-left">Forms</span>
                  <HiOutlineChevronDown />
                </button>
              </li>
              {/* Tables (dropdown) */}
              <li>
                <button className={getButtonClass("/admin/tables")} onClick={() => router.push("/admin/tables")}>
                  <FaTable />
                  <span className="flex-1 text-left">Tables</span>
                  <HiOutlineChevronDown />
                </button>
              </li>
              {/* Pages (dropdown) */}
              <li>
                <button className={getButtonClass("/admin/pages")} onClick={() => router.push("/admin/pages")}>
                  <FaWpforms />
                  <span className="flex-1 text-left">Pages</span>
                  <HiOutlineChevronDown />
                </button>
              </li>
            </ul>

          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        {children}
      </div>
    </div>
  );
}
