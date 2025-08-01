"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { comletePercentage, formatDateTime } from "@/lib/utils";
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
  Spin,
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
  // Fetch statistic data
  const { data: statisticData, isLoading: statisticLoading } = useSWR(
    `${Endpoints.Worklog.STATISTIC_BY_PROJECT(projectId)}`,
    fetcher
  );

  //Fetch contributors data by projectId
  const { data: contributorsData } = useSWR(
    `${Endpoints.ProjectContributor.GET_CONTRIBUTOR_BY_PROJECT(projectId)}`,
    fetcher
  );

  const completionRate =
    statisticData?.data?.totalSpentTime + statisticData?.data?.totalRemainTime >
    0
      ? (statisticData?.data?.totalSpentTime /
          (statisticData?.data?.totalSpentTime +
            statisticData?.data?.totalRemainTime)) *
        100
      : 0;
  // Fetch top contributors data
  const { data: topContributorsData, isLoading: topContributorsLoading } =
    useSWR(`${Endpoints.Worklog.WORKLOG_TOPS(projectId)}`, fetcher);

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
          worklog.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          worklog.taskId?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          worklog.timeSpent?.toString().includes(searchTerm) ||
          worklog.timeRemain?.toString().includes(searchTerm)
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
      filtered = filtered.filter((worklog: Worklog) => {
        return worklog.contributor?._id === selectedContributor;
      });
    }

    return filtered;
  }, [worklogData?.data, dateRange, selectedContributor, searchTerm]);

  // Table columns
  const worklogColumns = [
    {
      title: "Task name",
      dataIndex: "taskId",
      key: "taskId",
      render: (taskId: any) => (
        <Text strong className="text-gray-700">
          {taskId?.name || "N/A"}
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
            {contributor?.fullName}
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
          {startDate && formatDateTime(startDate)}
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
        <Text
          ellipsis={{ tooltip: description || "No description" }}
          className="text-gray-600"
        >
          {description || "No description"}
        </Text>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      {statisticLoading ? (
        <Spin size="large" />
      ) : (
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
                  {statisticData?.data?.totalSpentTime}h
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
                  {statisticData?.data?.totalRemainTime}h
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
                  {statisticData?.data?.totalTask}h
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
                  {statisticData?.data?.totalContributor}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Progress Overview */}
      <Card className="border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0 text-gray-700">
            Project Progress
          </Title>
          <Text className="text-lg font-semibold text-gray-600">
            {Math.round(completionRate)}% Complete
          </Text>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(completionRate)}%` }}
          ></div>
        </div>
        <Text type="secondary" className="text-sm mt-2 block">
          {statisticData?.data?.totalSpentTime}h completed of{" "}
          {statisticData?.data?.totalSpentTime +
            statisticData?.data?.totalRemainTime}
          h total estimated
        </Text>
      </Card>

      {/* Contributors Section */}
      {topContributorsLoading ? (
        <Spin size="large" />
      ) : (
        <Card className="border border-gray-200 rounded-lg shadow-sm mb-6">
          <Title level={4} className="mb-4 text-gray-700">
            Top Contributors
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topContributorsData?.data.map((stat: any) => (
              <div
                key={stat.contributor._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Avatar src={stat.contributor.avatar} size="large">
                  {stat.contributor.fullName}
                </Avatar>
                <div className="flex-1">
                  <Text strong className="text-gray-700">
                    {stat.contributor.fullName}
                  </Text>
                  <div className="text-sm text-gray-500">
                    {stat.totalSpentTime}h • {stat.totalTask} tasks
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-2 rounded-full"
                      style={{
                        width: `${comletePercentage(
                          stat.totalSpentTime,
                          stat.totalRemainTime
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Header with filters */}
      {isLoading ? (
        <Spin size="large" />
      ) : (
        <div className="flex items-center gap-3 mb-6 flex-row justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search time logs..."
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-[300px] h-[32px] board-search-input"
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
                    {contributorsData?.data?.map((contributor: any) => (
                      <Option
                        key={contributor.userId._id}
                        value={contributor.userId._id}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar src={contributor.userId.avatar} size="small">
                            {contributor.userId.fullName}
                          </Avatar>
                          {contributor.userId.fullName}
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
      )}

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
