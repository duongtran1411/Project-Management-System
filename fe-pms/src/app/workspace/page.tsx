"use client";
import CreateWorkspaceModal from "@/components/common/modal/createWorkspace";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/components/common/toast/toast";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getWorkspaceByUser,
  initWorkspace,
} from "@/lib/services/workspace/workspace.service";
import { InboxOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWorkspace, setIsWorkspace] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    const getWorkspace = async () => {
      try {
        setIsLoading(true);
        const response = await getWorkspaceByUser();
        if(!response){
          showWarningToast('Hãy tạo workspace ở đây')
          return; 
        }
        if (response.success) {
          setIsWorkspace(true);
          router.push("/workspace/viewall");
        }
      } catch (error: any) {
        const errorMessage =
          error?.data?.response?.messsage ||
          error?.message ||
          "đã có lỗi xảy ra";
        if (errorMessage) {
          showErrorToast(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getWorkspace();
  }, [router]);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const createWorkspace = async (name: string, description: string | null) => {
    try {
      const response = await initWorkspace(name, description);
      if (response.success) {
        setIsModalOpen(false);
        showSuccessToast(response.message);
        router.push('/workspace/viewall')
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };

  if (isLoading) {
    <Spin indicator={<LoadingOutlined spin />} size="large" />;
  }
  return (
    <div className="flex justify-center items-center h-screen">
      {!isWorkspace && (
        <>
          <div
            className="text-center hover:bg-gray-200 hover:cursor-pointer hover:rounded-xl"
            onClick={() => showModal()}>
            <InboxOutlined style={{ fontSize: 80 }} />
            <div>
              <Typography className="font-bold text-xl">
                <PlusOutlined className="mr-1" />Create Your Workspace
              </Typography>
            </div>
          </div>
          <CreateWorkspaceModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onSave={(name, description) => createWorkspace(name, description)}
          />
        </>
      )}
    </div>
  );
};

export default Page;
