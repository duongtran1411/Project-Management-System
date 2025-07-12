"use client";

import { TeamOutlined } from "@ant-design/icons";
import { Button, Card, Typography, Avatar, notification, Select } from "antd";
import { useRouter } from "next/navigation";
import type { NotificationArgsProps } from "antd";
import React, { useEffect, useMemo } from "react";
type NotificationPlacement = NotificationArgsProps["placement"];
const { Title, Text } = Typography;

const recommendedUsers = [
  { initials: "TD", color: "#6B46C1" },
  { initials: "LV", color: "#6B46C1" },
  { initials: "NS", color: "#6B46C1" },
  { initials: "G", color: "#ED8936" },
];

const Context = React.createContext({ name: "Default" });

export default function InvitePage() {
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();
  const [showInviteInput, setShowInviteInput] = React.useState(false);
  const [invites, setInvites] = React.useState<string[]>([]);

  const openNotification = (placement: NotificationPlacement) => {
    api.success({
      message: "Hub project sucessfully created",
      description: "Just a few more steps to get it connected.",
      placement,
    });
  };

  const contextValue = useMemo(() => ({ name: "Ant Design" }), []);

  useEffect(() => {
    // Open notification on </mount>
    openNotification("bottomLeft");
  }, []);

  // Danh sách gợi ý (có thể lấy từ recommendedUsers hoặc backend)
  const options = [
    { value: "kimquy001623@gmail.com", label: "kimquy001623@gmail.com" },
    { value: "anlphe176714@fpt.edu.vn", label: "anlphe176714@fpt.edu.vn" },
    { value: "Giang", label: "Giang" },
    { value: "Tran Dai Duong", label: "Tran Dai Duong" },
    { value: "Nguyễn Sơn", label: "Nguyễn Sơn" },
    { value: "Lê Văn Việt", label: "Lê Văn Việt" },
    { value: "Duong Tran", label: "Duong Tran" },
    { value: "trandaiduong1412000", label: "trandaiduong1412000" },
  ];

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
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
            <Text className="text-gray-700 text-xs font-semibold pt-6">
              Member
            </Text>
            <div className="mt-4 flex items-center space-x-2">
              {recommendedUsers.map((user, index) => (
                <Avatar
                  key={index}
                  style={{
                    backgroundColor: user.color,
                    verticalAlign: "middle",
                  }}
                >
                  {user.initials}
                </Avatar>
              ))}
            </div>

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
                  placeholder="Enter more"
                  value={invites}
                  onChange={setInvites}
                  options={options}
                  open={false} // Tắt dropdown, chỉ cho nhập tự do
                  tokenSeparators={[",", " "]}
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
            >
              Invite and continue
            </Button>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}
