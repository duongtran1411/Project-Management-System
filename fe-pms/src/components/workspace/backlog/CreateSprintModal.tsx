"use client";

import { CreateMilestone } from "@/types/types";
import { Modal, Form, Input, DatePicker } from "antd";

const { TextArea } = Input;

interface CreateSprintModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (values: CreateMilestone) => void;
  projectId: string;
}

const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
  open,
  onCancel,
  onCreate,
  projectId,
}) => {
  const [form] = Form.useForm<CreateMilestone>();

  //   useEffect(() => {
  //     if (open) {
  //       form.setFieldsValue({ projectId }); // set sẵn projectId nếu có
  //     }
  //   }, [open, projectId, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const formatted: CreateMilestone = {
        ...values,
        startDate: values.startDate,
        endDate: values.endDate,
        projectId,
      };
      onCreate(formatted);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Create Sprint"
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="Create"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Sprint Name"
          rules={[{ required: true, message: "Please enter sprint name" }]}
        >
          <Input placeholder="Enter sprint name" />
        </Form.Item>

        <Form.Item name="goal" label="Goal">
          <TextArea placeholder="What is the goal of this sprint?" rows={3} />
        </Form.Item>

        <Form.Item name="startDate" label="Start Date">
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item name="endDate" label="End Date">
          <DatePicker
            className="w-full"
            disabledDate={(current) => {
              const startDate = form.getFieldValue("startDate");
              return startDate && current.isBefore(startDate, "day");
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSprintModal;
