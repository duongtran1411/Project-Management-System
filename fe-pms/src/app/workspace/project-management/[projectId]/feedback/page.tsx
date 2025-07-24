"use client";
import { useParams } from "next/navigation";
import { List, Avatar, Typography, Button, Form, Input, Select } from "antd";
import {
  BugOutlined,
  CheckSquareOutlined,
  CommentOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { FeedBack } from "@/models/feedback/feedback";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import axiosService from "@/lib/services/axios.service";
import { format } from "date-fns";
import CreateFeedBackModal from "@/components/common/modal/createFeedBack";
import {
  createFeedback,
  updateFeedback,
} from "@/lib/services/feedback/feedback.service";
import { ProjectContributor } from "@/models/projectcontributor/project.contributor.model";
import { useRole } from "@/lib/auth/auth-project-context";
import { Project } from "@/models/project/project.model";
import { useAuth } from "@/lib/auth/auth-context";
const { Option } = Select;
export default function Page() {
  const { projectId } = useParams<{ projectId: string }>();
  const [feedbacks, setFeedbacks] = useState<FeedBack[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [contributor, setContributor] = useState<ProjectContributor | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projects, setProject] = useState<Project | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { role } = useRole();
  const { userInfo } = useAuth();
  const isReadOnly = role.name === "PROJECT_ADMIN";
  const fetcher = async (url: string): Promise<FeedBack[]> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      if (error) {
        showErrorToast(
          error.response.data.message || "Lỗi khi cập nhật sprint!"
        );
      }
    }
    return Promise.reject();
  };

  const { data, error, isLoading, mutate } = useSWR(
    `${Endpoints.Feedback.GET_BY_PROJECT_ID(projectId)}`,
    fetcher
  );
  const getProject = async (url: string): Promise<Project> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      if (error) {
        showErrorToast(
          error.response.data.message || "Lỗi khi cập nhật sprint!"
        );
      }
    }
    return Promise.reject();
  };

  const { data: project } = useSWR(
    `${Endpoints.Project.GET_BY_ID(projectId)}`,
    getProject
  );

  useEffect(() => {
    if (project) {
      setProject(project);
    }
  }, [project]);

  useEffect(() => {
    if (data) {
      setFeedbacks(data);
    }
  }, [data]);

  const getContributor = async (url: string): Promise<ProjectContributor> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      if (error) {
        showErrorToast(
          error.response.data.message || "Lỗi khi cập nhật sprint!"
        );
      }
    }

    return Promise.reject();
  };

  const {
    data: dataContritbutor,
    error: dataError,
    isLoading: contributorIsLoading,
  } = useSWR(
    `${Endpoints.ProjectContributor.GET_BY_PROJECT_ID(projectId)}`,
    getContributor
  );

  useEffect(() => {
    if (dataContritbutor) {
      setContributor(dataContritbutor);
    }
  }, [dataContritbutor]);

  const create = async (message: string, type: string) => {
    try {
      if (contributor) {
        const response = await createFeedback(
          contributor._id ? contributor._id : "",
          message,
          type
        );
        showSuccessToast(response.message);

        mutate();
      }
    } catch (error: any) {
      if (error) {
        showErrorToast(
          error.response.data.message || "Lỗi khi cập nhật sprint!"
        );
      }
    }
  };
  const [form] = Form.useForm();
  const onFinish = (feedbackId: string) => {
    const values = form.getFieldsValue();
    const feedback = feedbacks.find((fb) => fb._id === feedbackId);

    if (
      !feedback ||
      (values.message === feedback.message && values.type === feedback.type)
    ) {
      setIsEdit(false);
      setEditingId(null);
      return;
    }

    // Có thay đổi => gọi update
    update(feedbackId, values.message, values.type);
    form.resetFields();
  };

  const update = async (feedbackId: string, message: string, type: string) => {
    try {
      const response = await updateFeedback(feedbackId, message, type);
      if (response.success) {
        showSuccessToast(response.message);
        setIsEdit(false);
        form.resetFields();
        mutate();
      }
    } catch (error: any) {
      if (error) {
        showErrorToast(
          error.response.data.message || "Lỗi khi cập nhật sprint!"
        );
      }
    }
  };

  return (
    <div className="bg-zinc-50">
      <Typography className="text-center text-xl font-semibold">
        Feedback about {project?.name}
      </Typography>
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button
            className="bg-blue-500 text-zinc-100 hover:bg-blue-300"
            onClick={() => setIsModalOpen(true)}>
            <PlusOutlined className="mr-1" />
            Create
          </Button>
        </div>
      )}

      <div style={{ maxHeight: "500px", overflowY: "auto" }}>
        {feedbacks && (
          <List
            itemLayout="horizontal"
            dataSource={feedbacks}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  key={item._id}
                  avatar={
                    <Avatar src={item.createdBy.avatar}>
                      {item.createdBy.fullName.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <div className="flex flex-col">
                      <span>{item.email}</span>{" "}
                      <span style={{ color: "gray" }}>
                        {item.message}{" "}
                        {item.createdBy._id === userInfo?.userId && (
                          <EditOutlined
                            className="mx-2 hover:bg-gray-300"
                            onClick={() => {
                              setEditingId(
                                editingId === item._id ? null : item._id
                              );
                              setIsEdit(editingId !== item._id);
                            }}
                          />
                        )}
                      </span>
                      <span
                        className={`
                      ${item.type === "FEATURE_REQUEST" ? "text-blue-500" : ""}
                      ${item.type === "COMMENT" ? "text-green-500" : ""}
                      ${item.type === "BUG" ? "text-red-500" : ""}
                    `}>
                        {item.type}
                      </span>
                      {isEdit && editingId === item._id && (
                        <Form
                          key={item._id}
                          layout="vertical"
                          form={form}
                          onFinish={() => onFinish(item._id)}
                          style={{ marginTop: 24, textAlign: "left" }}>
                          <Form.Item
                            label="Message"
                            name="message"
                            initialValue={item.message}
                            rules={[
                              { required: true, message: "Email is required" },
                            ]}>
                            <Input.TextArea placeholder="PLease enter message ..." />
                          </Form.Item>

                          <Form.Item
                            label="Type"
                            name="type"
                            initialValue={item.type}
                            rules={[
                              { required: true, message: "Type is required" },
                            ]}>
                            <Select
                              placeholder="Select a type"
                              className="w-full"
                              defaultValue={item.type}>
                              <Option value="FEATURE_REQUEST">
                                <CheckSquareOutlined className="mr-1" />
                                FEATURE_REQUEST
                              </Option>
                              <Option value="BUG">
                                <BugOutlined className="mr-1" />
                                Bug
                              </Option>
                              <Option value="COMMENT">
                                <CommentOutlined className="mr-1" />
                                Comment
                              </Option>
                            </Select>
                          </Form.Item>
                          <Form.Item style={{ marginTop: 32 }}>
                            <Button
                              type="primary"
                              block
                              style={{ background: "#030e4f" }}
                              htmlType="submit">
                              Send
                            </Button>
                          </Form.Item>
                        </Form>
                      )}
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 4 }}>
                      {format(new Date(item.createdAt), "yyyy-MM-dd hh:mm")}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      <CreateFeedBackModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSave={(message, type) => create(message, type)}
      />
    </div>
  );
}
