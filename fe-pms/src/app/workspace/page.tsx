"use client";
import CreateWorkspaceModal from "@/components/common/modal/createWorkspace";
import { showErrorToast, showSuccessToast } from "@/components/common/toast/toast";
import { initWorkspace } from "@/lib/services/workspace/workspace.service";
import { InboxOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   router.push("/workspace/viewall");
  // }, [router]);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const createWorkspace = async (name: string, description: string | null) => {
    try {
      const response = await initWorkspace(name,description)
      if(response.success){
        setIsModalOpen(false)
        showSuccessToast(response.message)
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="text-center hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => showModal()}>
        <InboxOutlined style={{ fontSize: 80 }} />
        <div>
          <Typography className="font-bold text-xl">
            Create Your Workspace
          </Typography>
        </div>
      </div>
      <CreateWorkspaceModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSave={(name, description) => createWorkspace(name, description)}
      />
    </div>
  );
};

export default Page;
