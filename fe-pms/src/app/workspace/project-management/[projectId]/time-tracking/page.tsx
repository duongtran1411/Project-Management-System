"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { formatDateTime } from "@/lib/utils";
import { Worklog } from "@/models/worklog/worklog";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownOutlined,
  FilterOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Input,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

interface TimeTrackingStats {
  totalTimeSpent: number;
  totalTimeRemaining: number;
  totalTasks: number;
  uniqueContributors: number;
  completionRate: number;
}

interface ContributorStats {
  contributor: any;
  totalTimeSpent: number;
  totalTimeRemaining: number;
  tasksWorkedOn: number;
  completionRate: number;
}

const TimeTrackingReportPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [selectedContributor, setSelectedContributor] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch worklog data
  const { data: worklogData, isLoading } = useSWR(
    `${Endpoints.Worklog.GET_BY_PROJECT(projectId)}`,
    fetcher
  );

  console.log("worklogData", worklogData);

  // Filter worklog data
  const filteredWorklogs = useMemo(() => {
    if (!worklogData?.data) return [];
    let filtered = worklogData.data;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (worklog: Worklog) =>
          worklog.contributor?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          worklog.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((worklog: Worklog) => {
        const worklogDate = dayjs(worklog.startDate);
        return (
          worklogDate.isAfter(startDate.startOf("day")) &&
          worklogDate.isBefore(endDate.endOf("day"))
        );
      });
    }

    // Contributor filter
    if (selectedContributor) {
      filtered = filtered.filter(
        (worklog: Worklog) => worklog.contributor?._id === selectedContributor
      );
    }

    return filtered;
  }, [worklogData?.data, dateRange, selectedContributor, searchTerm]);

  // Calculate statistics
  const stats: TimeTrackingStats = useMemo(() => {
    const totalTimeSpent = filteredWorklogs.reduce(
      (sum: number, log: Worklog) => sum + (log.timeSpent || 0),
      0
    );
    const totalTimeRemaining = filteredWorklogs.reduce(
      (sum: number, log: Worklog) => sum + (log.timeRemain || 0),
      0
    );
    const uniqueContributors = new Set(
      filteredWorklogs.map((log: Worklog) => log.contributor?._id)
    ).size;
    const uniqueTasks = new Set(
      filteredWorklogs.map((log: Worklog) => log.taskId?._id)
    ).size;
    const completionRate =
      totalTimeSpent + totalTimeRemaining > 0
        ? (totalTimeSpent / (totalTimeSpent + totalTimeRemaining)) * 100
        : 0;

    return {
      totalTimeSpent,
      totalTimeRemaining,
      totalTasks: uniqueTasks,
      uniqueContributors,
      completionRate,
    };
  }, [filteredWorklogs]);

  // Get unique contributors for filter
  const uniqueContributors = useMemo(() => {
    if (!worklogData?.data) return [];
    const contributors = worklogData.data
      .map((log: Worklog) => log.contributor)
      .filter(Boolean);
    return contributors.filter(
      (contributor: any, index: number, self: any[]) =>
        index === self.findIndex((c) => c._id === contributor._id)
    );
  }, [worklogData?.data]);

  // Calculate contributor statistics
  const contributorStats: ContributorStats[] = useMemo(() => {
    const contributorMap = new Map();

    filteredWorklogs.forEach((worklog: Worklog) => {
      const contributorId = worklog.contributor?._id;
      if (!contributorId) return;

      if (!contributorMap.has(contributorId)) {
        contributorMap.set(contributorId, {
          contributor: worklog.contributor,
          totalTimeSpent: 0,
          totalTimeRemaining: 0,
          tasksWorkedOn: new Set(),
          completionRate: 0,
        });
      }

      const stat = contributorMap.get(contributorId);
      stat.totalTimeSpent += worklog.timeSpent || 0;
      stat.totalTimeRemaining += worklog.timeRemain || 0;
      stat.tasksWorkedOn.add(worklog.taskId?._id);
    });

    return Array.from(contributorMap.values())
      .map((stat) => ({
        ...stat,
        tasksWorkedOn: stat.tasksWorkedOn.size,
        completionRate:
          stat.totalTimeSpent + stat.totalTimeRemaining > 0
            ? (stat.totalTimeSpent /
                (stat.totalTimeSpent + stat.totalTimeRemaining)) *
              100
            : 0,
      }))
      .sort((a, b) => b.totalTimeSpent - a.totalTimeSpent);
  }, [filteredWorklogs]);

  // Table columns
  const worklogColumns = [
    {
      title: "Task ID",
      dataIndex: ["taskId", "_id"],
      key: "taskId",
      render: (taskId: string) => (
        <Text strong className="text-gray-700">
          {taskId?.slice(-8) || "N/A"}
        </Text>
      ),
    },
    {
      title: "Contributor",
      dataIndex: "contributor",
      key: "contributor",
      render: (contributor: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={contributor?.avatar} size="small">
            {contributor?.fullName?.[0]}
          </Avatar>
          <Text className="text-gray-600">{contributor?.fullName}</Text>
        </div>
      ),
    },
    {
      title: "Time Spent",
      dataIndex: "timeSpent",
      key: "timeSpent",
      render: (timeSpent: number) => (
        <Tag color="green" className="font-medium">
          {timeSpent || 0}h
        </Tag>
      ),
      sorter: (a: Worklog, b: Worklog) =>
        (a.timeSpent || 0) - (b.timeSpent || 0),
    },
    {
      title: "Time Remaining",
      dataIndex: "timeRemain",
      key: "timeRemain",
      render: (timeRemain: number) => (
        <Tag color="orange" className="font-medium">
          {timeRemain || 0}h
        </Tag>
      ),
      sorter: (a: Worklog, b: Worklog) =>
        (a.timeRemain || 0) - (b.timeRemain || 0),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (startDate: string) => (
        <Text type="secondary" className="text-sm">
          {formatDateTime(startDate)}
        </Text>
      ),
      sorter: (a: Worklog, b: Worklog) =>
        new Date(a.startDate || "").getTime() -
        new Date(b.startDate || "").getTime(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <Text ellipsis={{ tooltip: description }} className="text-gray-600">
          {description || "No description"}
        </Text>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header with filters */}
      <div className="flex items-center gap-3 mb-6 flex-row justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search time logs..."
            allowClear
            className="w-[450px] h-[10px] board-search-input"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Dropdown
            trigger={["click"]}
            dropdownRender={() => (
              <div className="bg-white p-4 rounded-lg shadow-lg border">
                <Text strong className="block mb-2">
                  Date Range:
                </Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) =>
                    setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
                  }
                  style={{ width: "100%" }}
                  placeholder={["Start Date", "End Date"]}
                />
              </div>
            )}
          >
            <Button className="flex items-center font-semibold text-gray-700">
              <CalendarOutlined className="mr-1" />
              Date Range <DownOutlined className="ml-1" />
            </Button>
          </Dropdown>

          <Dropdown
            trigger={["click"]}
            dropdownRender={() => (
              <div className="bg-white p-4 rounded-lg shadow-lg border min-w-[250px]">
                <Text strong className="block mb-2">
                  Contributors:
                </Text>
                <Select
                  value={selectedContributor}
                  onChange={setSelectedContributor}
                  placeholder="Select contributor"
                  style={{ width: "100%" }}
                  allowClear
                >
                  {uniqueContributors.map((contributor: any) => (
                    <Option key={contributor._id} value={contributor._id}>
                      <div className="flex items-center gap-2">
                        <Avatar src={contributor.avatar} size="small">
                          {contributor.fullName?.[0]}
                        </Avatar>
                        {contributor.fullName}
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          >
            <Button className="flex items-center font-semibold text-gray-700">
              <FilterOutlined className="mr-1" />
              Contributors <DownOutlined className="ml-1" />
            </Button>
          </Dropdown>
        </div>

        <Button
          onClick={() => {
            setDateRange(null);
            setSelectedContributor(null);
            setSearchTerm("");
          }}
          className="font-semibold text-gray-600"
        >
          Clear Filters
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ClockCircleOutlined className="text-green-600 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-sm">
                Total Time Spent
              </Text>
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalTimeSpent}h
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CalendarOutlined className="text-orange-600 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-sm">
                Time Remaining
              </Text>
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalTimeRemaining}h
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircleOutlined className="text-blue-600 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-sm">
                Tasks Tracked
              </Text>
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalTasks}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TeamOutlined className="text-purple-600 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-sm">
                Contributors
              </Text>
              <div className="text-2xl font-bold text-gray-800">
                {stats.uniqueContributors}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0 text-gray-700">
            Project Progress
          </Title>
          <Text className="text-lg font-semibold text-gray-600">
            {Math.round(stats.completionRate)}% Complete
          </Text>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(stats.completionRate)}%` }}
          ></div>
        </div>
        <Text type="secondary" className="text-sm mt-2 block">
          {stats.totalTimeSpent}h completed of{" "}
          {stats.totalTimeSpent + stats.totalTimeRemaining}h total estimated
        </Text>
      </Card>

      {/* Contributors Section */}
      <Card className="border border-gray-200 rounded-lg shadow-sm mb-6">
        <Title level={4} className="mb-4 text-gray-700">
          Top Contributors
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contributorStats.slice(0, 6).map((stat) => (
            <div
              key={stat.contributor._id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <Avatar src={stat.contributor.avatar} size="large">
                {stat.contributor.fullName?.[0]}
              </Avatar>
              <div className="flex-1">
                <Text strong className="text-gray-700">
                  {stat.contributor.fullName || "Unknown"}
                </Text>
                <div className="text-sm text-gray-500">
                  {stat.totalTimeSpent}h • {stat.tasksWorkedOn} tasks
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-2 rounded-full"
                    style={{ width: `${Math.round(stat.completionRate)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Time Logs Table */}
      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0 text-gray-700">
            Time Log Details
          </Title>
          <Text type="secondary">{filteredWorklogs.length} entries</Text>
        </div>
        <Table
          dataSource={filteredWorklogs}
          columns={worklogColumns}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: 1000, y: 600 }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default TimeTrackingReportPage;
