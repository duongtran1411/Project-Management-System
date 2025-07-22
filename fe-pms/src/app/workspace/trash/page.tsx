"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { restoreProject } from "@/lib/services/project/project.service";
import { Project } from "@/models/project/project.model";
import { UndoOutlined } from "@ant-design/icons";
import { Button, Card, List, Space, Tag, Tooltip, Typography } from "antd";
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
      if (projectId) {
        setRestoringId(projectId);
        await restoreProject(projectId);
        mutate();
      }
    } catch (error) {
      console.log("Error restore project", error);
    } finally {
      setLoading(false);
      setRestoringId(null);
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = dayjs(deletedAt);
    const permanentDeleteDate = deletedDate.add(30, "day");
    const daysLeft = permanentDeleteDate.diff(dayjs(), "day");
    return daysLeft > 0 ? daysLeft : 0;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Trash</Title>
        <Button type="primary" onClick={() => router.push("/workspace")}>
          Back to Projects
        </Button>
      </div>

      <Card>
        <List
          itemLayout="horizontal"
          dataSource={projectDeleted?.data}
          renderItem={(project: Project) => (
            <List.Item
              actions={[
                <Tooltip key="restore" title="Restore project">
                  <Button
                    type="text"
                    icon={<UndoOutlined />}
                    loading={loading || restoringId === project._id}
                    onClick={() => handleRestore(project._id || "")}
                    disabled={getDaysRemaining(project.deletedAt!) <= 0}
                  >
                    Restore
                  </Button>
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{project.name}</span>
                    <Tag color="red">Deleted</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">
                      Deleted {dayjs(project.deletedAt).fromNow()}
                    </Text>
                    <Text type="warning">
                      {getDaysRemaining(project.deletedAt!) > 0
                        ? `Will be permanently deleted in ${getDaysRemaining(
                            project.deletedAt!
                          )} days`
                        : "Scheduled for permanent deletion"}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default TrashPage;
