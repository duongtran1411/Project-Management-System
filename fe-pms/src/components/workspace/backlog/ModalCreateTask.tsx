"use client";

import { createTask } from "@/lib/services/task/task";
import { FieldType, Milestone } from "@/types/types";
import { Form, FormProps, Input, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";

interface Props {
  projectId: string;
  selectedMilestone: Milestone;
  //setSelectedMilestone: React.Dispatch<React.SetStateAction<Milestone>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mutateTask: () => void;
}

export const ModalCreateTask: React.FC<Props> = ({
  projectId,
  isModalOpen,
  setIsModalOpen,
  //setSelectedMilestone,
  selectedMilestone,
  mutateTask,
}) => {
  const [form] = Form.useForm<FieldType>();

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const data = {
      name: values.taskName!,
      description: values.taskDescription!,
      projectId,
      milestones: selectedMilestone._id,
    };

    await createTask(data);

    // gọi mutate để refresh lại task list
    await mutateTask();
    setIsModalOpen(false);
    // setSelectedMilestone(null);
    form.resetFields();
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Modal
      title="Create new task"
      closable={{ "aria-label": "Custom Close Button" }}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      className="p-3"
    >
      <Form
        form={form}
        name="Create New Task"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600, padding: 10 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Task name"
          name="taskName"
          rules={[{ required: true, message: "Enter task name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Task description"
          name="taskDescription"
          rules={[{ required: true, message: "Enter task description" }]}
        >
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
