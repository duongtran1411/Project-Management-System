"use client";

import { UploadOutlined } from "@ant-design/icons";
import { Avatar, Button, FormInstance, Modal, Upload } from "antd";
import { useState } from "react";

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
}

export const ModalUploadIcon: React.FC<Props> = ({
  isIconModalOpen,
  setIsIconModalOpen,
  setCurrentIcon,
  projectData,
  form,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null);

  const handleIconModalOk = () => {
    if (uploadedIcon) {
      setCurrentIcon(uploadedIcon);
      form.setFieldsValue({ icon: uploadedIcon });
    } else if (selectedIcon) {
      setCurrentIcon(selectedIcon);
      form.setFieldsValue({ icon: selectedIcon });
    }
    setIsIconModalOpen(false);
  };

  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudURL = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;

  if (!preset || !cloudURL) {
    throw new Error(
      "Missing CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_UPLOAD_URL"
    );
  }

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(cloudURL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    return data.secure_url;
  };

  const handleModalCancel = () => {
    setCurrentIcon(projectData?.data?.icon || "/project.png");
    setIsIconModalOpen(false);
    setSelectedIcon(null);
    setUploadedIcon(null);
  };
  return (
    <Modal
      title="Choose an icon"
      open={isIconModalOpen}
      onCancel={handleModalCancel}
      onOk={handleIconModalOk}
      okText="Select"
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={async ({ file, onSuccess, onError }) => {
            try {
              const url = await handleAvatarUpload(file as File);
              setCurrentIcon(url);
              setUploadedIcon(url);
              setSelectedIcon(null);
              form.setFieldsValue({ icon: url });
              if (onSuccess) {
                onSuccess("ok");
              }
            } catch (err) {
              if (onError) {
                onError(err as Error);
              }
            }
          }}
        >
          <Button icon={<UploadOutlined />}>Upload a photo</Button>
        </Upload>
        {uploadedIcon && (
          <div style={{ marginTop: 16 }}>
            <Avatar src={uploadedIcon} size={64} />
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
              setUploadedIcon(null);
            }}
          />
        ))}
      </div>
    </Modal>
  );
};
