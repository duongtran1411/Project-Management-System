import { Button, InputNumber, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";

interface RemoveLogButtonProps {
  open: boolean;
  onCancel: () => void;
  onConfirm?: (days: number) => void;
}
const RemoveLogButton: React.FC<RemoveLogButtonProps> = ({ open, onCancel,onConfirm }) => {
  const [days, setDays] = useState(0);

  const handleConfirm = () => {
    if (onConfirm) onConfirm(days);
  };

  const handleCancel = () => {
    setDays(0); 
    onCancel();
  };

  return (
    <Modal
      title="Xóa Log"
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Hủy">
      <p>Nhập số ngày bạn muốn giữ lại log:</p>
      <InputNumber
        min={0}
        value={days}
        onChange={(value) => setDays(value ?? 0)}
        style={{ width: "100%" }}
      />
    </Modal>
  );
};

export default RemoveLogButton;
