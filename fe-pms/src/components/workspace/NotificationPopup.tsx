import React, { useState } from "react";
import { Dropdown, Avatar, Typography, Tabs, Button, Badge } from "antd";
import {
  LikeOutlined,
  HeartOutlined,
  FireOutlined,
  SmileOutlined,
  PlusOutlined,
  BellOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface NotificationItem {
  id: string;
  avatar: string;
  initials: string;
  name: string;
  action: string;
  taskName: string;
  taskId: string;
  status: string;
  time: string;
  isUnread?: boolean;
  comment?: string;
  assigneeUpdate?: string;
}

const NotificationPopup: React.FC = () => {
  const [activeTab, setActiveTab] = useState("direct");

  const recentNotifications: NotificationItem[] = [
    {
      id: "1",
      avatar: "",
      initials: "TD",
      name: "Tran Dai Duong",
      action: "mentioned you",
      taskName: "",
      taskId: "",
      status: "",
      time: "",
    },
  ];

  const olderNotifications: NotificationItem[] = [
    {
      id: "2",
      avatar: "",
      initials: "TD",
      name: "Tran Dai Duong",
      action: "mentioned you in a comment",
      taskName: "All Work page",
      taskId: "SCRUM-72",
      status: "In Progress",
      time: "1 day ago",
      isUnread: true,
      comment: "@Nguyễn Sơn @Lê Văn Việt @Nguyễn Thị Làn K17 HL @Giang @",
    },
    {
      id: "3",
      avatar: "",
      initials: "NH",
      name: "Nguyễn Thị Làn K17 HL",
      action: "updated a task",
      taskName: "API statistic in summary user",
      taskId: "SCRUM-74",
      status: "To Do",
      time: "2 weeks ago",
      isUnread: true,
      assigneeUpdate: "Nguyễn Thị Làn K17 HL",
    },
    {
      id: "4",
      avatar: "",
      initials: "TD",
      name: "Tran Dai Duong",
      action: "updated a task",
      taskName: "API crud epic",
      taskId: "SCRUM-69",
      status: "In Progress",
      time: "3 weeks ago",
    },
    {
      id: "5",
      avatar: "",
      initials: "TD",
      name: "Tran Dai Duong",
      action: "updated a task",
      taskName: "API crud milestones",
      taskId: "SCRUM-60",
      status: "To Do",
      time: "3 weeks ago",
      assigneeUpdate: "Tran Dai Duong",
    },
    {
      id: "6",
      avatar: "",
      initials: "TD",
      name: "Tran Dai Duong",
      action: "updated a task",
      taskName: "API list epic and task in epic",
      taskId: "SCRUM-XX",
      status: "To Do",
      time: "3 weeks ago",
    },
  ];

  const renderReactionIcons = () => (
    <div className="flex gap-1 mb-3">
      <Button
        type="text"
        size="small"
        icon={<LikeOutlined />}
        className="text-gray-500 hover:text-blue-500"
      />
      <Button
        type="text"
        size="small"
        icon={<FireOutlined />}
        className="text-gray-500 hover:text-orange-500"
      />
      <Button
        type="text"
        size="small"
        icon={<HeartOutlined />}
        className="text-gray-500 hover:text-red-500"
      />
      <Button
        type="text"
        size="small"
        icon={<SmileOutlined />}
        className="text-gray-500 hover:text-yellow-500"
      />
      <Button
        type="text"
        size="small"
        icon={<PlusOutlined />}
        className="text-gray-500 hover:text-gray-700"
      />
    </div>
  );

  const renderNotificationItem = (item: NotificationItem) => (
    <div
      key={item.id}
      className={`p-5 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
        item.isUnread ? "bg-blue-50" : "bg-white"
      } hover:shadow-sm transition-all duration-200`}
    >
      <div className="flex items-start gap-4">
        <Avatar style={{ backgroundColor: "#722ed1" }} size={40}>
          {item.initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Text className="text-blue-600 hover:text-blue-800 cursor-pointer text-base">
              {item.name} {item.action} {item.time}
            </Text>
            {item.isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
            )}
          </div>

          {item.taskName && (
            <div className="mt-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm" />
                <Text className="text-sm font-medium">{item.taskName}</Text>
              </div>
              <Text className="text-sm text-gray-600">
                {item.taskId} • {item.status}
              </Text>
            </div>
          )}

          {item.comment && (
            <div className="mt-3 mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <Text className="text-sm">{item.comment}</Text>
            </div>
          )}

          {item.assigneeUpdate && (
            <div className="mt-3 mb-2">
              <div className="flex items-center gap-2">
                <Avatar style={{ backgroundColor: "#722ed1" }} size={24}>
                  {item.initials}
                </Avatar>
                <Text className="text-sm text-blue-600">
                  +1 assignee update from {item.assigneeUpdate}
                </Text>
              </div>
            </div>
          )}

          {item.comment && renderReactionIcons()}
        </div>
      </div>
    </div>
  );

  const items = [
    {
      key: "1",
      label: (
        <div className="w-[500px] max-h-[600px] overflow-y-auto">
          <div className="p-8">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "direct",
                  label: "Direct",
                },
                {
                  key: "watching",
                  label: "Watching",
                },
              ]}
              className="mb-4"
            />

            {activeTab === "direct" && (
              <div>
                {renderReactionIcons()}

                <div className="mb-6">
                  {recentNotifications.map(renderNotificationItem)}
                </div>

                <div className="mb-6">
                  <Text className="text-gray-500 text-sm font-medium mb-3">
                    Older
                  </Text>
                  {olderNotifications.map(renderNotificationItem)}
                </div>
              </div>
            )}

            {activeTab === "watching" && (
              <div className="text-center py-8">
                <Text className="text-gray-500">No watching notifications</Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      trigger={["click"]}
      overlayClassName="notification-dropdown"
    >
      <Badge count="9+" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined className="text-lg" />}
          className="text-gray-600 hover:text-gray-800"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationPopup;
