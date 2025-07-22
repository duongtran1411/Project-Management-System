"use client";
import HeaderWorkSpace from "@/components/workspace/HeaderWorkSpace";
import MenuWorkSpace from "@/components/workspace/MenuWorkSpace";
import NoFOUCWrapper from "@/components/common/spinner/NoFOUCWrapper";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colapsed, setCollapsed] = useState<boolean>(false);
  const onCollapse = () => {
    setCollapsed(!colapsed);
  };
  return (
    <NoFOUCWrapper>
      <div className="h-screen flex flex-col">
        <HeaderWorkSpace onCollapse={onCollapse} />
        <div className="flex flex-1 overflow-hidden">
          <div
            className={`${
              colapsed ? "w-16" : "w-64"
            } flex-shrink-0 bg-gray-100 border-r border-gray-300 transition-all duration-300`}
          >
            <MenuWorkSpace colapsed={colapsed} />
          </div>
          <div className="flex-1 overflow-auto bg-white">
            <div className="p-4 min-h-full">{children}</div>
          </div>
        </div>
      </div>
    </NoFOUCWrapper>
  );
}
