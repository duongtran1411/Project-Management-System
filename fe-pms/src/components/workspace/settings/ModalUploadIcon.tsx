"use client";

import { Avatar, Button, FormInstance, Modal, Spin, Upload } from "antd";
import { useState } from "react";
import { updateProject } from "@/lib/services/project/project.service";
import { UploadOutlined } from "@ant-design/icons";

const presetIcons = [
  "/project-1.png",
  "/project-2.png",
  "/project-3.png",
  "/project-4.png",
  "/project-5.png",
  "/project-6.png",
  "/project-7.png",
];
interface Props {
  isIconModalOpen: boolean;
  setIsIconModalOpen: (open: boolean) => void;
  setCurrentIcon: (icon: string) => void;
  form: FormInstance;
  projectData: any;
  mutate: () => void;
}

export const ModalUploadIcon: React.FC<Props> = ({
  isIconModalOpen,
  setIsIconModalOpen,
  setCurrentIcon,
  projectData,
  form,
  mutate,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIconModalOk = async () => {
    setLoading(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("icon", selectedFile || projectData?.data?.icon);
        const response = await updateProject(projectData?.data?._id, formData);
        if (response?.status === 200) {
          setCurrentIcon(response?.data?.data?.icon);
          form.setFieldsValue({ icon: response?.data?.data?.icon });
          mutate();
        }
      }

      setIsIconModalOpen(false);
      setSelectedIcon(null);
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setCurrentIcon(projectData?.data?.icon || "/project.png");
    setIsIconModalOpen(false);
    setSelectedIcon(null);
    setSelectedFile(null);
  };

  return (
    <>
      <Spin spinning={loading} fullscreen></Spin>
      <Modal
        title="Choose an icon"
        open={isIconModalOpen}
        onCancel={handleModalCancel}
        onOk={handleIconModalOk}
        okText="Save"
        confirmLoading={loading}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              setSelectedFile(file);
              setSelectedIcon(null);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>Upload a photo</Button>
          </Upload>

          {selectedFile && (
            <div style={{ marginTop: 8, textAlign: "center", color: "#555" }}>
              Selected file: <strong>{selectedFile.name}</strong>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {presetIcons.map((icon) => (
            <Avatar
              key={icon}
              src={icon}
              size={48}
              style={{
                border: selectedIcon === icon ? "2px solid #1890ff" : undefined,
                cursor: "pointer",
                boxShadow:
                  selectedIcon === icon ? "0 0 0 2px #1890ff" : undefined,
              }}
              onClick={() => {
                setSelectedIcon(icon);
              }}
            />
          ))}
        </div>
      </Modal>
    </>
  );
};
