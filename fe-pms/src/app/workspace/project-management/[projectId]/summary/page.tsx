"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Avatar, Row, Col } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  FileSyncOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";

// import StatusOverviewChart from "@/components/workspace/SummaryChart/PieChartTask";
// import PriorityBarChart from "@/components/workspace/SummaryChart/PriorityColumnChart";
// import ActivityRecent from "@/components/workspace/SummaryChart/ActivityRecent";
// import ProgressChart from "@/components/workspace/SummaryChart/EpicProgressChart";
const StatusOverviewChart = dynamic(
  () => import("@/components/workspace/SummaryChart/PieChartTask"),
  { ssr: false }
);
const PriorityBarChart = dynamic(
  () => import("@/components/workspace/SummaryChart/PriorityColumnChart"),
  { ssr: false }
);
const ActivityRecent = dynamic(
  () => import("@/components/workspace/SummaryChart/ActivityRecent"),
  { ssr: false }
);
const ProgressChart = dynamic(
  () => import("@/components/workspace/SummaryChart/EpicProgressChart"),
  { ssr: false }
);
import { useParams } from "next/navigation";

import { getTaskStatistic } from "@/lib/services/statistics/statistics.service";
import axiosService from "@/lib/services/axios.service";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import { TaskStatistic } from "@/models/statistic/statistic.model";

const assigneeColumns = [
  {
    title: "Assignee",
    dataIndex: "assignee",
    key: "assignee",
    render: (_: any, record: any) => (
      <span className="flex items-center gap-2">
        <Avatar src={record.avatar} />
        <span>{record.fullName}</span>
      </span>
    ),
  },
  {
    title: "Tasks",
    dataIndex: "count",
    key: "count",
    render: (count: number) => <Tag color="blue">{count}</Tag>,
  },
];

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

export default function SummaryPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [taskStatistic, setTaskStatistic] = useState<TaskStatistic>();
  const [totalTasks, setTotalTasks] = useState<number>();
  const [doneTasks, setDoneTasks] = useState<number>();
  const [inProgressTasks, setInProgressTasks] = useState<number>();
  const [todoTasks, setTodoTasks] = useState<number>();

  const { data: statisticsContributor } = useSWR(
    `${Endpoints.Statistics.STATISTIC_CONTRIBUTOR(projectId)}`,
    fetcher
  );

  useEffect(() => {
    const fetch = async (projectId: string) => {
      try {
        const response = await getTaskStatistic(projectId);
        console.log("Statistics Task", response);
        if (response) {
          // Statistics
          const total = response.totalTasks;
          const done =
            response.taskStatusStats.find((t: any) => t.status === "DONE")
              ?.count || 0;
          const inProgress =
            response.taskStatusStats.find(
              (t: any) => t.status === "IN_PROGRESS"
            )?.count || 0;
          const todo =
            response.taskStatusStats.find((t: any) => t.status === "TO_DO")
              ?.count || 0;
          setTotalTasks(total);
          setDoneTasks(done);
          setInProgressTasks(inProgress);
          setTodoTasks(todo);
          setTaskStatistic(response);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (projectId) fetch(projectId);
  }, [projectId]);

  const summaryCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: (
        <SnippetsOutlined className="text-blue-500 p-1 text-xl mt-[4px] rounded-md p-2" />
      ),
      bgColor: "bg-blue-100",
    },
    {
      title: "Done",
      value: doneTasks,
      icon: (
        <CheckCircleOutlined className="text-green-500 p-1 text-xl mt-[4px] rounded-md p-2" />
      ),
      bgColor: "bg-green-100",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: (
        <CalendarOutlined className="text-red-500 p-1 text-xl mt-[4px] rounded-md p-2" />
      ),
      bgColor: "bg-red-100",
    },
    {
      title: "To do",
      value: todoTasks,
      icon: (
        <FileSyncOutlined className="text-orange-500 p-1 text-xl mt-[4px] rounded-md p-2" />
      ),
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        {summaryCards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              styles={{
                body: {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                },
              }}
              className=" h-full !shadow !rounded-xl"
            >
              <div className={`${card.bgColor} rounded-[4px]`}>{card.icon}</div>
              <div className="text-2xl font-bold">{card.value}</div>
              <span className="font-semibold text-gray-700">{card.title}</span>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Status Breakdown & Chart Placeholder */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="!shadow !rounded-xl w-[567px] h-[320px]">
            <div className="mb-2 font-semibold">Status overview</div>
            <span className="mb-2 text-sm text-gray-500">
              Get a snapshot of the status of your work items.{" "}
            </span>

            <StatusOverviewChart taskStatistic={taskStatistic} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="!shadow !rounded-xl">
            <ActivityRecent />
          </Card>
        </Col>
      </Row>

      {/* Sprint/Report Section */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="!shadow !rounded-xl w-[567px] h-[320px]">
            <div className="mb-2 font-semibold">Priority breakdown</div>
            <span className="mb-2 text-sm text-gray-500">
              Get a holistic view of how work is being prioritized.
            </span>

            <PriorityBarChart />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="!shadow !rounded-xl h-[320px]">
            <div className="mb-2 font-semibold">Team workload</div>
            <span className="mb-2 text-sm text-gray-500">
              Monitor the capacity of your team.
            </span>
            <Table
              columns={assigneeColumns}
              dataSource={statisticsContributor?.contributorStats}
              pagination={false}
              size="small"
              scroll={{ y: 180 }}
              rowKey="_id"
            />
          </Card>
        </Col>
      </Row>

      {/* Epic Progress Bard */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="!shadow !rounded-xl w-[567px] height-[320px]">
            <div className="font-semibold mb-2">Epic progress</div>
            <span className="text-sm text-gray-500 mb-2">
              See how your epics are progressing at a glance.
            </span>
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-600" /> Done
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500" /> In progress
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-400" /> To do
              </div>
            </div>

            <ProgressChart />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
