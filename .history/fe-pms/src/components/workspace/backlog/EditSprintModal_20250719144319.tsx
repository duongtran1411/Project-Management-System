"use client";
import { Modal, Form, Input, DatePicker } from "antd";

import { useEffect } from "react";
import dayjs from "dayjs";
import { mutate } from "swr";
import { Endpoints } from "@/lib/endpoints";
import { Milestone } from "@/models/milestone/milestone.model";

const { TextArea } = Input;

interface EditSprintModalProps {
  open: boolean;
  onCancel: () => void;
  onUpdate: (values: Milestone) => void;
  milestone: Milestone | null;
}

const EditSprintModal: React.FC<EditSprintModalProps> = ({
  open,
  onCancel,
  onUpdate,
  milestone,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (milestone) {
      form.setFieldsValue({
        name: milestone.name,
        startDate: dayjs(milestone.startDate),
        endDate: dayjs(milestone.endDate),
        goal: milestone.goal,
      });
    }
  }, [milestone, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onUpdate({
        ...milestone!,
        name: values.name,
        goal: values.goal,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });
      await mutate(
        `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Milestone.MILESTONE}`
      );
      form.resetFields();
    });
  };

  return (
    <Modal
      title={`Edit sprint: ${milestone?.name}`}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="Update"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Sprint name"
          name="name"
          rules={[{ required: true, message: "Sprint name is required" }]}
        >
          <Input placeholder="Enter sprint name" />
        </Form.Item>

        <Form.Item
          label="Start date"
          name="startDate"
          rules={[{ required: true, message: "Start date is required" }]}
        >
          <DatePicker showTime />
        </Form.Item>

        <Form.Item
          label="End date"
          name="endDate"
          rules={[{ required: true, message: "End date is required" }]}
        >
          <DatePicker
            showTime
            disabledDate={(current) => {
              const startDate = form.getFieldValue("startDate");
              return startDate && current.isBefore(startDate, "day");
            }}
          />
        </Form.Item>

        <Form.Item label="Sprint goal" name="goal">
          <TextArea rows={4} placeholder="Enter sprint goal (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSprintModal;
