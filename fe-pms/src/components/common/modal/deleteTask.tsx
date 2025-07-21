import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Task } from "@/models/task/task.model";
const { Text, Paragraph } = Typography;

interface DeleteTaskModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: () => void;
  task: Task;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  open,
  onCancel,
  onDelete,
  task,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={false}
      width={450}>
      <Space direction="vertical" size="middle" className="w-full">
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined
            style={{ color: "#ff4d4f", fontSize: 20 }}
          />
          <Text strong style={{ fontSize: 18 }}>
            Permanently delete Task '{task.name}'?
          </Text>
        </div>

        <Paragraph type="warning" className="font-medium">
          This Task and all attachments, and data will be permanently deleted.
          If you're not sure, you can resolve or close this Task instead.
        </Paragraph>

        <div className="flex justify-end gap-2 mt-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button danger type="primary" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default DeleteTaskModal;
