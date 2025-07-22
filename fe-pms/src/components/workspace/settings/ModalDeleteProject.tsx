"use client";

import { deleteProject } from "@/lib/services/project/project.service";
import { WarningOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectname: string;
  mutate: () => void;
}

export const ModalDeleteProject: React.FC<Props> = ({
  isOpen,
  onClose,
  projectId,
  projectname,
  mutate,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const handleOk = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      await deleteProject(projectId);
      router.push("/workspace/viewall");
      mutate();
      onClose();
    } catch (error) {
      console.error("Failed to delete project", error);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    onClose();
  };
  return (
    <>
      {loading && <Spin size="large" tip="Loading..." fullscreen />}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <WarningOutlined
              style={{
                color: "#ff4d4f",
              }}
            />
            Delete Project
          </span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          danger: true,
        }}
      >
        <p>
          Are you sure you want to delete project:{" "}
          <strong>{projectname}</strong> ?{" "}
        </p>
      </Modal>
    </>
  );
};
