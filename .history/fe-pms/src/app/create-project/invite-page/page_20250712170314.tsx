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
} from "antd";
import { useRouter } from "next/navigation";
import type { NotificationArgsProps } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { isValidEmail } from "@/lib/utils";
type NotificationPlacement = NotificationArgsProps["placement"];
const { Title, Text } = Typography;

const Context = React.createContext({ name: "Default" });

export default function InvitePage() {
  const [api, notificationHolder] = notification.useNotification();
  const [messageApi, messageHoler] = message.useMessage();
  const router = useRouter();
  const [showInviteInput, setShowInviteInput] = React.useState(false);
  const [invites, setInvites] = React.useState<string[]>([]);
  const [disabledInvite, setDisabledInvite] = useState<boolean>(true);

  const openNotification = (placement: NotificationPlacement) => {
    api.success({
      message: "Hub project sucessfully created",
      description: "Just a few more steps to get it connected.",
      placement,
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

  return (
    <Context.Provider value={contextValue}>
      {notificationHolder}
      {messageHoler}
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
              onClick={() => router.push("/workspace/project-management")}
            >
              Skip
            </Button>
            <Button
              type="primary"
              onClick={() => router.push("/workspace/project-management")}
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
