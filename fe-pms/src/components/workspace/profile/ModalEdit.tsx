"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { updateUser } from "@/lib/services/user/user.service";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, FormInstance, Image, Input, Modal, Upload } from "antd";
import { useState } from "react";

interface Props {
  userId: string;
  mutate: () => void;
  setShowEditModal: React.Dispatch<React.SetStateAction<any>>;
  setAvatarPreview: React.Dispatch<React.SetStateAction<any>>;
  showEditModal: boolean;
  avatarPreview: string | undefined;
  formEdit: FormInstance<any>;
}
export const ModalEdit: React.FC<Props> = ({
  userId,
  mutate,
  setShowEditModal,
  showEditModal,
  setAvatarPreview,
  avatarPreview,
  formEdit,
}) => {
  const { setUserInfo } = useAuth();
  const [editLoading, setEditLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudURL = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;

  console.log("preset, cloudURL", preset, cloudURL);

  if (!preset || !cloudURL) {
    throw new Error(
      "Missing CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_UPLOAD_URL"
    );
  }

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(cloudURL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setAvatarUploading(false);
    return data.secure_url;
  };

  const handleEditProfile = async (values: any) => {
    setEditLoading(true);
    try {
      if (userId) {
        const response = await updateUser(userId, values);

        if (response) {
          setUserInfo(response);
        }
        await mutate();
        setShowEditModal(false);
      }
    } catch {
    } finally {
      setEditLoading(false);
    }
  };
  return (
    <Modal
      open={showEditModal}
      title="Update Profile"
      onCancel={() => setShowEditModal(false)}
      onOk={() => formEdit.submit()}
      confirmLoading={editLoading}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={formEdit} layout="vertical" onFinish={handleEditProfile}>
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Avatar">
          <Upload
            showUploadList={false}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                const url = await handleAvatarUpload(file as File);
                setAvatarPreview(url);
                formEdit.setFieldsValue({ avatar: url });
                if (onSuccess) {
                  onSuccess("ok");
                }
              } catch (err) {
                if (onError) {
                  onError(err as Error);
                }
              }
            }}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={avatarUploading}>
              Upload Avatar
            </Button>
          </Upload>
          {avatarPreview && (
            <div className="mt-2">
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                width={80}
                height={80}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                preview={false}
              />
            </div>
          )}
          {/* Ẩn input URL, chỉ dùng upload file và preview ảnh */}
          <Form.Item name="avatar" hidden>
            <Input type="hidden" />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone"
          rules={[
            { pattern: /^\d{9,11}$/, message: "Số điện thoại không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
