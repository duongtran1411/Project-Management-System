import HeaderProjectManagement from "@/components/workspace/HeaderProjectManagement";
import React from "react";
import { ProjectContext } from "@/context/ProjectContext";

const layout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) => {
  return (
    <ProjectContext.Provider value={{ projectId: params.projectId }}>
      <div className="min-h-screen bg-gray-50">
        <HeaderProjectManagement />
        <main className="p-4">{children}</main>
      </div>
    </ProjectContext.Provider>
  );
};

export default layout;
