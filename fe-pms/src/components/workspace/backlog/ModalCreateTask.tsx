"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { createTask } from "@/lib/services/task/task.service";
import { Milestone } from "@/models/milestone/milestone.model";
import { FieldType } from "@/types/types";
import { Form, FormProps, Input, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import useSWR from "swr";

interface Props {
  projectId: string;
  selectedMilestone: Milestone;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mutateTask: () => void;
}

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

export const ModalCreateTask: React.FC<Props> = ({
  projectId,
  isModalOpen,
  setIsModalOpen,
  //setSelectedMilestone,
  selectedMilestone,
  mutateTask,
}) => {
  const [form] = Form.useForm<FieldType>();

  const { data: projectData } = useSWR(
    `${Endpoints.Project.GET_BY_ID(projectId)}`,
    fetcher
  );

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const defaultAssign = projectData?.data?.defaultAssign;
    let data;
    if (defaultAssign) {
      data = {
        name: values.taskName!,
        description: values.taskDescription!,
        projectId,
        milestones: selectedMilestone._id,
        assignee: defaultAssign,
      };
    } else {
      data = {
        name: values.taskName!,
        description: values.taskDescription!,
        projectId,
        milestones: selectedMilestone._id,
      };
    }

    await createTask(data);
    await mutateTask();
    setIsModalOpen(false);
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

        <Form.Item<FieldType> label="Task description" name="taskDescription">
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
