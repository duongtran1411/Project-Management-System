"use client";
import { showErrorToast } from "@/components/common/toast/toast";
import HeaderProjectManagement from "@/components/workspace/HeaderProjectManagement";
import { RoleProvider } from "@/lib/auth/auth-project-context";
import { getRoleByProjectId } from "@/lib/services/projectRole/projectRole.service";
import { ProjectRole } from "@/models/projectrole/project.role.model";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<ProjectRole | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter()
  useEffect(() => {
    const getRole = async () => {
      try {
        const response = await getRoleByProjectId(projectId);
        if (response.success) {
          setRole(response.data.role);
          if (response.data.role.name === "Stakeholder") {
            router.push(`${projectId}/board`);
          }
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          "Failed to fetch role project of user";
        showErrorToast(message);
        return null;
      }
    };

    getRole();
  }, [projectId]);
  if (!role) {
    return <Spin indicator={<LoadingOutlined spin />} size="large" />;
  }
  return (
    <div className="max-h-screen bg-gray-50">
      <HeaderProjectManagement />
      <RoleProvider role={role} projectId={projectId}>
        <main className=" p-4">{children}</main>
      </RoleProvider>
    </div>
  );
};

export default ProjectLayout;
