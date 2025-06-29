"use client";
import HeaderWorkSpace from "@/components/workspace/HeaderWorkSpace";
import MenuWorkSpace from "@/components/workspace/MenuWorkSpace";
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
    <div>
      <HeaderWorkSpace onCollapse={onCollapse} />
      <div>
        <div className="flex h-screen">
          <div className={`w-max bg-gray-100 w-max`}>
            <MenuWorkSpace colapsed={colapsed} />
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
}
