import HeaderProjectManagement from "@/components/workspace/HeaderProjectManagement";
import React from "react";


const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderProjectManagement />
      <main className="p-4">{children}</main>
    </div>
  );
};

export default layout;
