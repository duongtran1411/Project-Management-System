"use client";

import React from "react";
import { Card, Table, Tag, Avatar, Row, Col } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  FileSyncOutlined,
  SnippetsOutlined,
  UserOutlined,
} from "@ant-design/icons";

import StatusOverviewChart from "@/components/workspace/SummaryChart/PieChartTask";
import PriorityBarChart from "@/components/workspace/SummaryChart/PriorityColumnChart";

import ActivityRecent from "@/components/workspace/SummaryChart/ActivityRecent";
import ProgressChart from "@/components/workspace/SummaryChart/EpicProgressChart";

// Sample data (from backlog)
const tasks = [
  {
    key: "SCRUM-101",
    name: "Implement login API",
    epic: "Authentication",
    status: "TO DO",
    assignee: "Trần Đại Dương",
  },
  {
    key: "SCRUM-102",
    name: "Build user dashboard",
    epic: "User Interface",
    status: "IN PROGRESS",
    assignee: "Hoàng Thị Hương Giang",
  },
  {
    key: "SCRUM-103",
    name: "Create project API",
    epic: "Project Management",
    status: "DONE",
    assignee: "Nguyễn Thái Sơn",
  },

  {
    key: "SCRUM-105",
    name: "Optimize database queries",
    epic: "Performance",
    status: "IN PROGRESS",
    assignee: "Lê Văn Việt",
  },

  {
    key: "SCRUM-105",
    name: "Create user profile page",
    epic: "Performance",
    status: "IN PROGRESS",
    assignee: "UnAssigned",
  },
];

// Statistics
const totalTasks = tasks.length;
const doneTasks = tasks.filter((t) => t.status === "DONE").length;
const inProgressTasks = tasks.filter((t) => t.status === "IN PROGRESS").length;
const todoTasks = tasks.filter((t) => t.status === "TO DO").length;

// Assignee breakdown
const assigneeMap: Record<string, number> = {};
tasks.forEach((t) => {
  assigneeMap[t.assignee] = (assigneeMap[t.assignee] || 0) + 1;
});
const assigneeData = Object.entries(assigneeMap).map(([name, count]) => ({
  name,
  count,
}));

const assigneeColumns = [
  {
    title: "Assignee",
    dataIndex: "name",
    key: "name",
    render: (name: string) => (
      <span className="flex items-center gap-2">
        <Avatar icon={<UserOutlined />} size="small" />
        {name}
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

export default function SummaryPage() {
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
          <Card className="!shadow !rounded-xl w-[567px] height-[320px]">
            <div className="mb-2 font-semibold">Status overview</div>
            <span className="mb-2 text-sm text-gray-500">
              Get a snapshot of the status of your work items.{" "}
            </span>

            <StatusOverviewChart />
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
          <Card className="!shadow !rounded-xl w-[567px] height-[320px]">
            <div className="mb-2 font-semibold">Priority breakdown</div>
            <span className="mb-2 text-sm text-gray-500">
              Get a holistic view of how work is being prioritized.
            </span>

            <PriorityBarChart />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="!shadow !rounded-xl">
            <div className="mb-2 font-semibold">Team workload</div>
            <span className="mb-2 text-sm text-gray-500">
              Monitor the capacity of your team.
            </span>
            <Table
              columns={assigneeColumns}
              dataSource={assigneeData}
              pagination={false}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
      </Row>

      {/* Epic Progress Bard */}
      {/* Sprint/Report Section */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="!shadow !rounded-xl w-[567px] height-[320px]">
            <div className="font-semibold mb-2">Epic progress</div>
            <span className="text-sm text-gray-500 mb-2">
              See how your epics are progressing at a glance.
            </span>

            <ProgressChart />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
