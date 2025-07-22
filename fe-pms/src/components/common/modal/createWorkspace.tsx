import React from "react";
import { Modal, Input, Divider, Typography, Form, message } from "antd";
import { DropboxOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: (name: string, description: string | null) => void;
}

const CreateWorkspaceModal: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  onSave,
}) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = (values: { name: string; description?: string }) => {
    const fullName = `${values.name}'s Workspace`;
    onSave(fullName, values.description || null);
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <Modal
      title={
        <Title level={3}>
          <DropboxOutlined className="mr-1" />
          Create Workspace
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null} // Không dùng nút OK/Cancel mặc định
    >
      <Divider />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="flex flex-col"
      >
        <Form.Item
          label='Name'
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên workspace!" },
            {
              pattern: /^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/,
              message:
                "Có ít nhất 1 kí tự chữ, có thể có số, không có khoảng trắng.",
            },
          ]}
        >
          <Input placeholder="Workspace Name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input placeholder="Optional Description" />
        </Form.Item>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </Form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
