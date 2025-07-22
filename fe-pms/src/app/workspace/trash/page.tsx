"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { restoreProject } from "@/lib/services/project/project.service";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  InfoCircleOutlined,
  UndoOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  List,
  Modal,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const TrashPage = () => {
  const router = useRouter();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: projectDeleted, mutate } = useSWR(
    `${Endpoints.Project.TRASH_PROJECT}`,
    fetcher
  );

  const handleRestore = async (projectId: string) => {
    try {
      setLoading(true);
      setRestoringId(projectId);
      const response = await restoreProject(projectId);
      if (response?.status === 200) {
        mutate();
        router.push("/workspace/viewall");
      }
    } catch (error) {
      console.error("Error restoring project", error);
    } finally {
      setLoading(false);
      setRestoringId(null);
    }
  };

  //get days remaining
  const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = dayjs(deletedAt);
    const permanentDeleteDate = deletedDate.add(30, "day");
    const daysLeft = permanentDeleteDate.diff(dayjs(), "day");
    return daysLeft > 0 ? daysLeft : 0;
  };

  //get progress percentage
  const getProgressPercentage = (deletedAt: string) => {
    const daysPassed = dayjs().diff(dayjs(deletedAt), "day");
    return Math.min(Math.round((daysPassed / 30) * 100), 100);
  };

  const showConfirm = (project: any) => {
    Modal.confirm({
      title: `Restore project "${project.name}"?`,
      icon: <ExclamationCircleFilled style={{ color: "#1890ff" }} />,
      content: (
        <div className="mt-4">
          <p>This will restore the project and all its contents.</p>
          {project.deletedAt && (
            <p className="mt-2 text-gray-500">
              Deleted on:{" "}
              {dayjs(project.deletedAt).format("MMM D, YYYY hh:mm A")}
            </p>
          )}
        </div>
      ),
      okText: "Restore",
      okButtonProps: {
        type: "primary",
        loading,
      },
      cancelText: "Cancel",
      onOk() {
        if (project._id) {
          handleRestore(project._id);
        }
      },
      onCancel: () => {
        // router.push("/workspace/trash");
      },
      autoFocusButton: "cancel",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            Trash
          </Title>
          <Text type="secondary">
            Projects will be permanently deleted after 30 days in trash
          </Text>
        </div>
        <Button
          type="primary"
          onClick={() => router.push("/workspace/viewall")}
        >
          Back to view all projects
        </Button>
      </div>

      <Card className="shadow-sm">
        <List
          itemLayout="vertical"
          dataSource={projectDeleted?.data || []}
          renderItem={(project: any) => {
            const daysRemaining = getDaysRemaining(project.deletedAt!);
            const progress = getProgressPercentage(project.deletedAt!);

            return (
              <List.Item
                className="hover:bg-gray-50 rounded-lg p-4 transition-colors"
                actions={[
                  <div key="progress" className="w-full">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Time remaining: {daysRemaining} days </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          progress > 80
                            ? "bg-red-500"
                            : progress > 50
                            ? "bg-orange-400"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>,
                  <div key="actions" className="flex justify-end mt-4">
                    <Tooltip title="Restore project">
                      <Button
                        type="primary"
                        icon={<UndoOutlined />}
                        loading={loading && restoringId === project._id}
                        onClick={() => showConfirm(project)}
                        disabled={daysRemaining <= 0}
                        className="flex items-center gap-2"
                      >
                        Restore
                      </Button>
                    </Tooltip>
                  </div>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={project.icon || "/project.png"}
                      size={48}
                      shape="square"
                      className="flex items-center justify-center bg-gray-100"
                    >
                      {!project.icon && (
                        <span className="text-lg font-semibold text-gray-500">
                          {project.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </Avatar>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">
                        {project.name}
                      </span>
                      <Tag color={daysRemaining <= 0 ? "red" : "orange"}>
                        {daysRemaining <= 0 ? "Expired" : "In Trash"}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-2 mt-2">
                      {project.description && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <InfoCircleOutlined className="mt-1" />
                          <span>{project.description}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <UserOutlined />
                          <span>Project Lead: </span>
                          <span className="font-medium">
                            {project.projectLead?.fullName || "Unassigned"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarOutlined />
                          <span>Deleted: </span>
                          <span className="font-medium">
                            {dayjs(project.deletedAt).format("MMM D, YYYY")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <ClockCircleOutlined />
                          <span>Permanent deletion: </span>
                          <span className="font-medium">
                            {dayjs(project.deletedAt)
                              .add(30, "day")
                              .format("MMM D, YYYY")}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />

        {(!projectDeleted?.data || projectDeleted.data.length === 0) && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🗑️</div>
            <Title level={4} className="text-gray-500">
              Your trash is empty
            </Title>
            <Text type="secondary">Projects you delete will appear here</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TrashPage;
