"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { updateProfile } from "@/lib/services/user/user.service";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, FormInstance, Image, Input, Modal, Upload } from "antd";
import { useState } from "react";

interface Props {
  userId: string;
  mutate: () => void;
  setShowEditModal: React.Dispatch<React.SetStateAction<any>>;
  showEditModal: boolean;
  avatarPreview: string | undefined;
  formEdit: FormInstance<any>;
}
export const ModalEdit: React.FC<Props> = ({
  userId,
  mutate,
  setShowEditModal,
  showEditModal,
  formEdit,
  avatarPreview,
}) => {
  const { setUserInfo } = useAuth();
  const [editLoading, setEditLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleEditProfile = async (values: any) => {
    setEditLoading(true);
    try {
      if (selectedFile) {
        console.log("selectedFile", selectedFile);
        const formData = new FormData();
        formData.append("fullName", values.fullName);
        formData.append("email", values.email);
        formData.append("phone", values.phone);
        formData.append("file", selectedFile);
        const response = await updateProfile(userId, formData);
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
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              setSelectedFile(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>Upload Avatar</Button>
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

          {selectedFile && (
            <div style={{ marginTop: 8, textAlign: "center", color: "#555" }}>
              Selected file: <strong>{selectedFile.name}</strong>
            </div>
          )}
          {/* Ẩn input URL, chỉ dùng upload file và preview ảnh */}
          {/* <Form.Item name="avatar" hidden>
            <Input type="hidden" />
          </Form.Item> */}
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
