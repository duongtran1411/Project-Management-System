"use client";
import { ModalEdit } from "@/components/workspace/profile/ModalEdit";
import { Constants } from "@/lib/constants";
import { Endpoints } from "@/lib/endpoints";
import { changePassword } from "@/lib/services/authentication/auth";
import axiosService from "@/lib/services/axios.service";
import { TokenPayload } from "@/models/user/TokenPayload";
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Image,
  Input,
  List,
  Typography,
} from "antd";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const { Title, Text } = Typography;

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const UserProfilePage = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
  );
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [userId, setUserId] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      setUserId(decoded.userId);
    }
  }, []);

  const { data: user, mutate } = useSWR(
    `${Endpoints.User.GET_BY_ID(userId || "")}`,
    fetcher
  );

  const { data: projectList } = useSWR(
    `${Endpoints.ProjectContributor.GET_PROJECTS_BY_USER(userId || "")}`,
    fetcher
  );

  const handlePasswordFinish = async (values: any) => {
    try {
      await changePassword({
        email: user.data.email,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      setShowChangePassword(false);
      form.resetFields();
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenEdit = () => {
    formEdit.setFieldsValue({
      fullName: user.data.fullName,
      email: user.data.email,
      avatar: user.data.avatar,
      phone: user.data.phone,
    });
    setAvatarPreview(user.data.avatar);
    setShowEditModal(true);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 py-8 rounded-sm">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Left column: Avatar, Name, About */}
        <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
          <div className="w-full flex justify-center mb-4">
            <Avatar size={144} src={user?.data?.avatar || undefined}>
              {user?.data?.fullName ? user?.data?.fullName : "U"}
            </Avatar>
          </div>
          <Title level={3} className="!mb-2 !text-center w-full">
            {user?.data?.fullName}
          </Title>
          <Button
            type="default"
            className="border-blue-500 text-blue-600 mb-6 w-full"
            style={{ borderColor: "#3b82f6" }}
            onClick={handleOpenEdit}
          >
            Manage your account
          </Button>

          <Card className="w-full mb-6">
            <Divider className="!my-3" />
            <Text strong>Email</Text>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <MailOutlined />
              <span>{user?.data?.email}</span>
            </div>
            <Divider className="!my-3" />
            <Text strong>Full Name</Text>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <UserOutlined />
              <span>{user?.data?.fullName}</span>
            </div>

            <Divider className="!my-3" />
            <Text strong>Phone</Text>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <PhoneOutlined />
              <span>{user?.data?.phone ? user.data?.phone : "..."}</span>
            </div>
          </Card>
        </div>

        {/* Right column: Places you work in + Change password */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {/* Places you work in */}
          <Card className="mb-6">
            <Title level={5}>Places you work in</Title>
            <div className="max-h-[320px] overflow-auto">
              <List
                itemLayout="horizontal"
                dataSource={projectList?.data}
                renderItem={(item: any) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-100 transition"
                    onClick={() =>
                      router.push(
                        `/workspace/project-management/${item.projectId}`
                      )
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Image
                          src="/project.png"
                          width={24}
                          height={24}
                          alt=""
                        />
                      }
                      title={
                        <span className="text-blue-700 font-medium">
                          {item.name}
                        </span>
                      }
                      description={
                        <span className="text-xs text-gray-500">
                          {item.projectType}
                        </span>
                      }
                    />
                  </List.Item>
                )}
                rowKey="_id"
              />
            </div>
          </Card>

          {/* Change your password */}
          <Card
            title={
              <span>
                <LockOutlined /> Change your password
              </span>
            }
          >
            {showChangePassword ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePasswordFinish}
                className="max-w-md"
              >
                <Form.Item
                  name="oldPassword"
                  label="Current password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your current password",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="New password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your new password",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm new password"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your new password",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="mr-2">
                    Save
                  </Button>
                  <Button onClick={() => setShowChangePassword(false)}>
                    Cancel
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <Button
                type="primary"
                onClick={() => setShowChangePassword(true)}
              >
                Change your password
              </Button>
            )}
          </Card>
        </div>
      </div>
      {/* Modal update user profile */}
      {userId && (
        <ModalEdit
          userId={userId}
          mutate={mutate}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          avatarPreview={avatarPreview}
          setAvatarPreview={setAvatarPreview}
          formEdit={formEdit}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
