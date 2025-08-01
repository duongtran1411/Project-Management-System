"use client";

import { MailOutlined, TeamOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Typography,
  notification,
  Select,
  message,
  Tag,
  Spin,
} from "antd";

import { useParams, useRouter } from "next/navigation";
import type { NotificationArgsProps } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { isValidEmail } from "@/lib/utils";
import axiosService from "@/lib/services/axios.service";
import { InviteMultiple } from "@/types/types";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import { inviteMemberMultiple } from "@/lib/services/projectContributor/projectContributor.service";
import { ProjectRole } from "@/models/projectrole/project.role.model";
type NotificationPlacement = NotificationArgsProps["placement"];
const { Title, Text } = Typography;

const Context = React.createContext({ name: "Default" });
const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

type NotificationType = "success" | "info" | "warning" | "error";

export default function InvitePage() {
  const [api, notificationHolder] = notification.useNotification();
  const [messageApi, messageHoler] = message.useMessage();
  const router = useRouter();
  const [showInviteInput, setShowInviteInput] = React.useState(false);
  const [invites, setInvites] = React.useState<string[]>([]);
  const [disabledInvite, setDisabledInvite] = useState<boolean>(true);
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectRoleId, setProjectRoleId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const { data: projectRoleData, error: projectRoleError } = useSWR(
    `${Endpoints.ProjectRole.GET_ALL}`,
    fetcher
  );
  useEffect(() => {
    if (projectRoleData && !projectRoleError) {
      const projectContributor = projectRoleData?.data.find(
        (role: ProjectRole) => role.name === "CONTRIBUTOR"
      );
      if (projectContributor) {
        setProjectRoleId(projectContributor._id);
      } else {
        console.error("Project role 'CONTRIBUTOR' not found");
      }
    }
  }, [projectRoleData, projectRoleError]);

  const openNotification = (placement: NotificationPlacement) => {
    api.success({
      message: "Hub project sucessfully created",
      description: "Just a few more steps to get it connected.",
      placement,
    });
  };

  const openNotificationWithIcon = (
    type: NotificationType,
    title: string,
    description: string
  ) => {
    api[type]({
      message: title,
      description: description,
    });
  };

  const contextValue = useMemo(() => ({ name: "Ant Design" }), []);

  useEffect(() => {
    openNotification("bottomLeft");
  }, []);

  useEffect(() => {
    if (invites.length > 0) {
      setDisabledInvite(false);
    }
  }, [invites]);

  const handleChangeInvites = (newValue: string[]) => {
    const validEmails = newValue.filter((email) => {
      if (!isValidEmail(email)) {
        messageApi.open({
          type: "error",
          content: `Invalid email: ${email}`,
        });
        return false;
      }
      return true;
    });

    setInvites(validEmails);
  };

  const handleInvite = async () => {
    try {
      if (!projectId || !projectRoleId) {
        messageApi.error("Missing project ID or role ID");
        return;
      }
      setLoading(true);
      const data: InviteMultiple = {
        emails: invites,
        projectId,
        projectRoleId,
      };
      const response = await inviteMemberMultiple(data);
      if (response?.success && response?.success?.length > 0) {
        response.success.forEach((item: any) => {
          openNotificationWithIcon(
            "success",
            "Thêm thành viên thành công",
            item.message
          );
        });
      }
      if (response?.errors && response?.errors?.length > 0) {
        response.errors.forEach((item: any) => {
          openNotificationWithIcon(
            "error",
            "Thêm thành viên thất bại",
            item.error
          );
        });
      }
      router.push(`/workspace/project-management/${projectId}`);
    } catch (e) {
      console.log(e);
      messageApi.error("Failed to invite members");
    }
    setLoading(false);
  };

  return (
    <Context.Provider value={contextValue}>
      {notificationHolder}
      {messageHoler}
      {loading && <Spin size="large" tip="Loading..." fullscreen />}
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 mx-auto mt-[-120px]">
        <div className="w-[50%]">
          <Title level={2}>Bring the team with you</Title>
          <Text>
            Invite these teammates to your project, and create work together.
          </Text>

          <Card className="mt-6  bg-gray-100">
            <Title level={3}>
              <TeamOutlined className="pr-2" />
              Recommended teammates
            </Title>
            <Text className="text-gray-600">
              Invite these teammates from your previous projects.
            </Text>
            <br />
            {/* <Text className="text-gray-700 text-xs font-semibold pt-6">
              Member
            </Text> */}
            <div className="mt-4 flex items-center space-x-2"></div>
            <Button
              className="mt-4 font-semibold bg-gray-100 text-gray-600"
              type="default"
              onClick={() => setShowInviteInput((prev) => !prev)}
            >
              Manage invites
            </Button>
            {showInviteInput && (
              <div className="mt-4">
                {/* Input email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter names or emails
                  </label>
                  <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    placeholder="Enter emails"
                    value={invites}
                    open={false}
                    onChange={handleChangeInvites}
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <Tag
                          color="blue"
                          closable={closable}
                          onClose={onClose}
                          style={{ marginRight: 3 }}
                          icon={<MailOutlined />}
                        >
                          {label}
                        </Tag>
                      );
                    }}
                  />
                </div>

                {/* Select role  */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Select role"
                    value={projectRoleId}
                    onChange={(value) => setProjectRoleId(value)}
                  >
                    {projectRoleData?.data
                      .filter(
                        (role: ProjectRole) => role.name !== "PROJECT_ADMIN"
                      )
                      .map((role: ProjectRole) => (
                        <Option key={role._id} value={role._id}>
                          {role.name}
                        </Option>
                      ))}
                  </Select>
                </div> */}
              </div>
            )}
          </Card>
        </div>
        {/* footer */}
        <div className="flex items-center justify-between w-full border-t-[1px] border-gray-300 p-6 mt-8 fixed bottom-0">
          <Text className="block text-md text-center text-gray-600 font-semibold">
            Step 1 of 2
          </Text>
          <div className="flex justify-between gap-5">
            <Button
              type="text"
              className=" text-gray-600 font-semibold"
              onClick={() =>
                router.push(`/workspace/project-management/${projectId}`)
              }
            >
              Skip
            </Button>
            <Button
              type="primary"
              onClick={handleInvite}
              disabled={disabledInvite}
            >
              Invite and continue
            </Button>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}
