"use client";

import { ModalUploadIcon } from "@/components/workspace/settings/ModalUploadIcon";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { updateProject } from "@/lib/services/project/project.service";
import { changeProjectLead } from "@/lib/services/projectContributor/projectContributor.service";
import { SaveOutlined, UserOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Form,
  Input,
  message,
  Select,
  Spin,
} from "antd";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import useSWR from "swr";

const { TextArea } = Input;
const { Option } = Select;

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const ProjectSettingPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const projectId = params.projectId as string;
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  const {
    data: projectData,
    error,
    isLoading,
    mutate,
  } = useSWR(`${Endpoints.Project.GET_BY_ID(projectId || "")}`, fetcher);

  const initialProjectLeadId = projectData?.data?.projectLead?._id;

  const router = useRouter();

  const [currentIcon, setCurrentIcon] = useState<string>(
    projectData?.data?.icon || "/project.png"
  );

  // Fetch project contributors
  const { data: contributorsData } = useSWR(
    `${Endpoints.ProjectContributor.GET_USER_BY_PROJECT(projectId || "")}`,
    fetcher
  );

  useEffect(() => {
    if (projectData?.data) {
      form.setFieldsValue({
        name: projectData.data.name,
        description: projectData.data.description || "",
        status: projectData.data.status || "TODO",
        projectLead: projectData.data.projectLead?._id,
        defaultAssign: projectData.data.defaultAssign
          ? "Project Lead"
          : "Unassigned",
        icon: projectData.data.icon || "/project.png",
      });
      setCurrentIcon(projectData.data.icon || "/project.png");
    }
  }, [projectData, form]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const selectedProjectLead = contributorsData?.data?.find(
        (contributor: any) => contributor.userId._id === values.projectLead
      );

      // Check if project lead has changed
      const projectLeadChanged =
        form.getFieldValue("projectLead") !== initialProjectLeadId;

      // If only project lead changed
      if (projectLeadChanged) {
        const response = await changeProjectLead(
          projectId,
          initialProjectLeadId,
          values.projectLead
        );
        if (response?.status === 200) {
          router.push("/workspace/viewall");
        }
      }

      if (!projectLeadChanged) {
        let defaultAssignValue = null;
        if (values.defaultAssign === "Project Lead") {
          defaultAssignValue = selectedProjectLead?.userId._id || null;
        } else if (values.defaultAssign === "Unassigned") {
          defaultAssignValue = null;
        }

        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("status", values.status);
        formData.append("defaultAssign", defaultAssignValue);
        await updateProject(projectId, formData);
      }

      setCurrentIcon(values.icon || currentIcon);
      mutate();
    } catch (error) {
      console.error(error);
      message.error("An error occurred while updating the project");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description="Failed to load project data."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modal chọn icon */}
      <ModalUploadIcon
        isIconModalOpen={isIconModalOpen}
        setIsIconModalOpen={setIsIconModalOpen}
        setCurrentIcon={setCurrentIcon}
        form={form}
        projectData={projectData}
        mutate={mutate}
      />

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="space-y-6"
        >
          {/* Project Icon */}
          <div className="flex flex-col items-center mb-8">
            <Avatar
              src={currentIcon}
              size={80}
              icon={<UserOutlined />}
              className="mb-4"
            />
            <Button type="default" onClick={() => setIsIconModalOpen(true)}>
              Change icon
            </Button>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Required fields are marked with an asterisk{" "}
            <span className="text-red-500">*</span>
          </div>

          {/* Project Name */}
          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </span>
            }
            name="name"
            rules={[
              { required: true, message: "Please enter project name" },
              { min: 2, message: "Project name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="Enter project name"
              className="h-10 border-gray-300"
            />
          </Form.Item>

          {/* Project Description */}
          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Description
              </span>
            }
            name="description"
            rules={[
              { max: 500, message: "Description cannot exceed 500 characters" },
            ]}
          >
            <TextArea
              placeholder="Describe your project..."
              rows={4}
              showCount
              maxLength={500}
              className="border-gray-300"
            />
          </Form.Item>

          {/* Project Lead */}
          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Project Lead
              </span>
            }
            name="projectLead"
            rules={[{ required: true, message: "Please select project lead" }]}
          >
            <Select
              placeholder="Select project lead"
              className="h-10"
              style={{ borderColor: "#d1d5db" }}
            >
              {contributorsData?.data?.map((contributor: any) => (
                <Option
                  key={contributor?.userId?._id}
                  value={contributor?.userId?._id}
                >
                  <div className="flex items-center gap-3 p-2">
                    <Avatar src={contributor?.userId?.avatar} />
                    <p>{contributor?.userId?.fullName}</p>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Project Status */}
          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Project Status <span className="text-red-500">*</span>
              </span>
            }
            name="status"
            rules={[
              { required: true, message: "Please select project status" },
            ]}
          >
            <Select
              placeholder="Select project status"
              className="h-10"
              style={{ borderColor: "#d1d5db" }}
            >
              <Option value="TODO">To Do</Option>
              <Option value="INPROGRESS">In Progress</Option>
              <Option value="DONE">Done</Option>
            </Select>
          </Form.Item>

          {/* Default Assignee */}
          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Default Assignee
              </span>
            }
            name="defaultAssign"
          >
            <Select
              placeholder="Select default assignee"
              className="h-10"
              style={{ borderColor: "#d1d5db" }}
            >
              <Option value={null}>Unassigned</Option>
              <Option value={projectData?.data?.projectLead?._id}>
                Project Lead
              </Option>
            </Select>
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              onClick={() => {
                if (projectData?.data) {
                  form.setFieldsValue({
                    name: projectData.data.name,
                    description: projectData.data.description || "",
                    status: projectData.data.status || "TODO",
                    projectLead: projectData.data.projectLead?._id,
                    defaultAssign: projectData.data.defaultAssign
                      ? "Project Lead"
                      : "Unassigned",
                    icon: projectData.data.icon || "/project.png",
                  });
                  setCurrentIcon(projectData.data.icon || "/project.png");
                }
              }}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProjectSettingPage;
