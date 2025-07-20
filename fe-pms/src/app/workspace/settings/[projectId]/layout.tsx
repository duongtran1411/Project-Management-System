"use client";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Dropdown, Menu } from "antd";
import { useRouter, useParams } from "next/navigation";
import axiosService from "@/lib/services/axios.service";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import Link from "next/link";
import { useState } from "react";
import { ModalDeleteProject } from "@/components/workspace/settings/ModalDeleteProject";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const onCloseModalDelete = () => {
    setIsModalDeleteOpen(false);
  };

  const handleBack = () => {
    router.push(`/workspace/project-management/${projectId}`);
  };
  const { data: projectData, mutate } = useSWR(
    `${Endpoints.Project.GET_BY_ID(projectId)}`,
    fetcher
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Breadcrumb */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb
              className="text-sm text-gray-600 mb-2"
              items={[
                {
                  title: (
                    <Link href="/workspace/viewall">View all projects</Link>
                  ),
                },
                {
                  title: (
                    <Link href={`/workspace/project-management/${projectId}`}>
                      {projectData?.data?.name || "Project"}
                    </Link>
                  ),
                },
                { title: "Project settings" },
              ]}
            />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">Details</h1>
              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key }) => {
                      if (key === "delete") {
                        setIsModalDeleteOpen(true);
                      }
                    }}
                    items={[
                      {
                        key: "delete",
                        icon: (
                          <DeleteOutlined
                            style={{
                              color: "#ff4d4f",
                              fontSize: "16px",
                              fontWeight: 600,
                            }}
                          />
                        ),
                        label: (
                          <span
                            style={{
                              color: "#505258",
                              fontSize: "16px",
                              fontWeight: 500,
                            }}
                          >
                            Move to trash
                          </span>
                        ),
                      },
                    ]}
                  />
                }
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  className="text-gray-500"
                />
              </Dropdown>
            </div>
          </div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="text-gray-600"
          >
            Back to project
          </Button>
        </div>
      </div>
      {projectData?.data._id && (
        <ModalDeleteProject
          isOpen={isModalDeleteOpen}
          onClose={onCloseModalDelete}
          projectId={projectData.data._id}
          projectname={projectData.data.name}
          mutate={mutate}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 bg-white">{children}</div>
    </div>
  );
}
