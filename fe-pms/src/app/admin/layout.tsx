"use client";

import Sidebar from "@/components/adminScreen/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="w-[256px] bg-gray-100">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto bg-white">{children}</div>
    </div>
  );
}
