"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Input, Button, Typography, Form, message, Image } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/services/project/project";
import { Project, ProjectContributor } from "@/types/types";
import { useEffect, useState } from "react";
import { Constants } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { createProjectContributor } from "@/lib/services/projectContributor/projectContributor";

const { Title, Text } = Typography;
type FormType = {
  name: string;
  description: string;
};

export default function ProjectForm() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      setUserId(decoded.userId);
    } else {
      console.error("User ID not found in local storage");
    }
  }, []);

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const projectData: Project = {
        name: values.name,
        description: values.description,
        projectType: "SOFTWARE",
        projectLead: userId || "",
      };

      const newProject = await createProject(projectData);
      if (newProject == null) {
        message.success("Fail to create project!");
        form.resetFields();
        return;
      }

      console.log("New Project Created:", newProject);

      const projecContributorData: ProjectContributor = {
        userId: userId || "",
        projectId: newProject?._id || "",
        projectRoleId: "64b1e2905a1c000001000005",
      };
      await createProjectContributor(projecContributorData);
      message.success("Project created successfully!");
      router.push(`/create-project/invite-page/${newProject._id}`);
    } catch (error) {
      message.error("Please fill in required fields!");
      console.log(error);
    }
  };

  const onFinishFailed = () => {
    message.error("Submit failed!");
  };

  const handleCancel = () => {
    form.resetFields();
  };

  return (
    <>
      <div
        className=" flex items-center gap-2 m-7 hover:cursor-pointer hover:bg-gray-200 p-2 rounded-md transition-all w-max"
        onClick={() => router.push("/workspace/viewall")}
      >
        <ArrowLeftOutlined />
        <Text className="font-semibold text-gray-600">
          Back to View All Projects
        </Text>
      </div>
      <div className="p-8 max-w-4xl mx-auto my-[60px]">
        <div className=" space-y-4 flex gap-4 items-center justify-center">
          <div className="text-left">
            <Title level={2}>Add project details</Title>
            <Text className="text-gray-800">
              Explore what’s possible when you collaborate with your team. Edit
              project details anytime in project settings.
            </Text>
            <br />
            <p className="text-gray-500 text-xs my-4">
              Required fields are marked with an asterisk{" "}
              <span className="text-red-600">*</span>
            </p>
            <Form
              form={form}
              layout="vertical"
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item<FormType>
                name="name"
                label="Name"
                rules={[
                  { required: true, message: "Your project must have a name!" },
                ]}
              >
                <Input placeholder="Enter your project name" />
              </Form.Item>

              <Form.Item<FormType> name="description" label="Description">
                <TextArea placeholder="Enter your project description" />
              </Form.Item>
            </Form>
          </div>

          <div>
            <div className="m-4">
              <Text strong className="text-gray-600">
                Template
              </Text>
              <div className="mt-2 border-[1px] border-gray-400 transition-all flex items-center gap-3 rounded-[10px] w-[400px] h-[100px]">
                <div className="bg-gray-100 w-[110px] h-full rounded-l-[10px] flex items-center justify-center">
                  <Image
                    width={60}
                    src="/scrum.png"
                    className=" object-cover"
                  ></Image>
                </div>
                <div className="py-[8px] px-[24px]">
                  <Text className="text-md font-semibold text-gray-800">
                    Scrum
                  </Text>
                  <p className="text-[10px] text-gray-500 text-wrap">
                    Sprint toward your project goals with a board, backlog, and
                    timeline.
                  </p>
                </div>
              </div>
            </div>

            <div className="m-4">
              <Text strong className="text-gray-600">
                Type
              </Text>
              <div className="mt-2 border-[1px] border-gray-400 transition-all flex items-center gap-3 rounded-[10px] w-[400px] h-[100px]">
                <div className="bg-purple-100 w-[110px] h-full rounded-l-[10px] flex items-center justify-center">
                  <Image
                    width={60}
                    src="/networking.png"
                    className=" object-cover"
                  ></Image>
                </div>

                <div className="py-[8px] px-[24px]">
                  <Text className="text-md font-semibold text-purple-800">
                    Team-managed
                  </Text>
                  <p className="text-[10px] text-gray-500 text-wrap">
                    Control your own working processes in a self-contained
                    space.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4 border-t-2 border-gray-200 p-7">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
