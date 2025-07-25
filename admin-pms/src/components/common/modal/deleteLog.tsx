import { DatePicker, InputNumber, Modal } from "antd";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
interface RemoveLogButtonProps {
  open: boolean;
  onCancel: () => void;
  onConfirm?: (days: number, beforeDay: Dayjs | null) => void;
}
const RemoveLogButton: React.FC<RemoveLogButtonProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  const [days, setDays] = useState(0);
  const [beforeDay, setBeforeDay] = useState<Dayjs | null>(dayjs());
  const handleConfirm = async () => {
    if (onConfirm) await onConfirm(days, beforeDay);
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
      <DatePicker
        value={beforeDay}
        format="YYYY-MM-DD"
        onChange={(value) => setBeforeDay(value)}
        className="mt-2 w-full"
      />
    </Modal>
  );
};

export default RemoveLogButton;
