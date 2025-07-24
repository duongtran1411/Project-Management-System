"use client";

import { updateProject } from "@/lib/services/project/project.service";
import { UploadOutlined } from "@ant-design/icons";
import { Button, FormInstance, Modal, Spin, Upload } from "antd";
import { useState } from "react";

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
        ></div>
      </Modal>
    </>
  );
};
