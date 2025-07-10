"use client";
import { createStyles } from "@/components/common/antd/createStyle";
import Spinner from "@/components/common/spinner/spin";
import { showErrorToast } from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { ActivityLog } from "@/models/logsystem/Logsystem";
import { TokenPayload } from "@/models/user/TokenPayload";
import {
  Space,
  Table,
  Tag,
  Tooltip,
  DatePicker,
  Button,
  Select,
  Input,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import type { TablePaginationConfig } from "antd/es/table";
import { Pagination } from "@/models/pagination/Pagination";
import { FilterOutlined } from "@ant-design/icons";
import { Filter } from "@/models/filter/Filter";
import dayjs, { Dayjs } from "dayjs";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css({
      [`${antCls}-table`]: {
        [`${antCls}-table-container`]: {
          [`${antCls}-table-body`]: {
            scrollbarWidth: "thin",
            scrollbarColor: "#eaeaea transparent",
          },
        },
      },
    }),
  };
});
const columns: ColumnsType<ActivityLog> = [
  {
    title: "No.",
    width: 50,
    key: "No.",
    render: (_: any, __: any, index: number) => index + 1,
    fixed: "left",
  },
  {
    title: "Full Name",
    width: 150,
    key: "fullName",
    render: (record) => record.entityId?.fullName || "-",
    fixed: "left",
  },
  {
    title: "Role",
    width: 100,
    dataIndex: "entity",
    key: "entity",
    fixed: "left",
    align: "center",
    render: (role) => {
      let color = "default";
      if (typeof role === "string") {
        if (role.toLowerCase() === "user") color = "green";
        else if (role.toLowerCase() === "admin") color = "purple";
      }
      return <Tag color={color}>{role?.toUpperCase()}</Tag>;
    },
  },
  { title: "Action", width: 150, dataIndex: "action", key: "action" },
  { title: "Device", width: 700, dataIndex: "userAgent", key: "userAgent" },
  {
    title: "Method",
    width: 150,
    key: "loginMethod",
    render: (record) => record.details?.loginMethod || "-",
  },
  {
    title: "Request Method",
    width: 150,
    key: "requestMethod",
    align: "center",
    render: (record) => {
      const method = record.requestMethod?.toUpperCase();
      let color = "default";
      switch (method) {
        case "GET":
          color = "blue";
          break;
        case "POST":
          color = "green";
          break;
        case "PUT":
          color = "gold";
          break;
        case "DELETE":
        case "DEL":
          color = "red";
          break;
        default:
          color = "default";
      }
      return <Tag color={color}>{method}</Tag>;
    },
  },
  {
    title: "URl",
    width: 200,
    dataIndex: "requestUrl",
    key: "requestUrl",
    render: (url) =>
      url && url.length > 30 ? (
        <Tooltip title={url}>{url.slice(0, 27) + "..."}</Tooltip>
      ) : (
        url
      ),
  },
  {
    title: "Status",
    width: 100,
    fixed: "right",
    dataIndex: "status",
    key: "status",
    align: "center",
    render: (status) => {
      let color = "default";
      if (typeof status === "string") {
        if (status.toLowerCase() === "success") color = "green";
        else if (status.toLowerCase() === "failed") color = "red";
      }
      return <Tag color={color}>{status?.toUpperCase()}</Tag>;
    },
  },
];

export default function Page() {
  const { customTable } = useStyle;
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    limit: 10,
    page: 1,
    totalPages: 4,
  });
  const [filter, setFilter] = useState<Filter>();
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [searchAction, setSearchAction] = useState<string>("");
  const defaultFilter = {
    status: undefined,
    action: "",
    startDate: undefined,
    endDate: undefined,
  };
  useEffect(() => {
    const token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setUserId(decoded.userId);
      } catch (e) {
        showErrorToast("Invalid token");
      }
    }
  }, []);
  const handlePageSize = (pagination: TablePaginationConfig) => {
    const newPage = pagination.current;
    const newLimit = pagination.pageSize;
    if (newPage && newLimit) {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
        limit: newLimit,
      }));
    }
  };

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      limit: pagination.limit.toString(),
      page: pagination.page.toString(),
    });
    if (filter?.startDate) params.set("startDate", filter.startDate);
    if (filter?.endDate) params.set("endDate", filter.endDate);
    if (filter?.status) params.set("status", filter.status);
    if (filter?.action) params.set("action", filter.action);
    return params.toString();
  }, [pagination, filter]);

  const fetcher = async (url: string): Promise<ActivityLog[]> => {
    const response = await axiosService.getAxiosInstance().get(url);
    if (response.data) {
      setPagination(response.data.pagination);
    }
    return response.data.data;
  };

  const { data, error, isLoading } = useSWR(
    userId ? `${Endpoints.ActivityLog.GET_ALL}?${queryString}` : "",
    fetcher
  );

  if (error) {
    showErrorToast(error.message);
  }

  useEffect(() => {
    if (data) {
      setActivityLogs(data);
    }
  }, [data]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div style={{ width: "100%" }}>
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">
        ACTIVITY LOGS
      </h2>
      <hr className="border-grey-500 border-2 w-3/4 mx-auto mb-4" />
      <Tooltip title="show filter">
        <Button
          className="mx-7 mb-2 bg-blue-500 text-zinc-100"
          onClick={() => setShowFilter((prev) => !prev)}>
          Filter <FilterOutlined />
        </Button>
      </Tooltip>
      {showFilter && (
        <div className="flex justify-start mx-7">
          <Space direction="horizontal" size={12}>
            <Tooltip>
              <RangePicker
                value={dateRange}
                onChange={(dates, dateStrings) => {
                  if (dates) setDateRange(dates);
                  else setDateRange(null);
                  setFilter((prev) => ({
                    ...prev,
                    startDate: dateStrings[0] || undefined,
                    endDate: dateStrings[1] || undefined,
                  }));
                }}
              />
            </Tooltip>
            <Select
              style={{ width: 200 }}
              mode="tags"
              allowClear
              onChange={(value) => console.log(value)}
              placeholder="Select method">
              <Option value="GET">
                <Tag color="blue">GET</Tag>
              </Option>
              <Option value="POST">
                <Tag color="green">POST</Tag>
              </Option>
              <Option value="PUT">
                <Tag color="gold">PUT</Tag>
              </Option>
              <Option value="DEL">
                <Tag color="red">DELETE</Tag>
              </Option>
            </Select>
            <Select
              defaultValue={selectedStatus}
              style={{ width: 200 }}
              allowClear
              onChange={(value) => {
                setSelectedStatus(value);
                setFilter((prev) => ({
                  ...prev,
                  status: value,
                }));
              }}
              placeholder="Status">
              <Option value="SUCCESS">
                <Tag color="green">SUCCESS</Tag>
              </Option>
              <Option value="FAILED">
                <Tag color="red">FAILED</Tag>
              </Option>
            </Select>
            <Search
              placeholder="Search action"
              defaultValue={searchAction}
              onSearch={(value) => {
                setSearchAction(value);
                setFilter((prev) => ({
                  ...prev,
                  action: value,
                }));
              }}
              style={{ width: 200 }}
            />
            <Button
              onClick={() => {
                setFilter(defaultFilter);
                setDateRange(null);
                setSelectedStatus(undefined);
                setSearchAction("");
              }}>
              Clear Filter
            </Button>
          </Space>
        </div>
      )}

      <div className="flex justify-center items-center w-50">
        <Table
          size="small"
          rowKey={(record) => record._id}
          className={customTable}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            pageSizeOptions: ["10", "15", "20"],
            defaultPageSize: pagination.limit,
          }}
          style={{ padding: 30 }}
          columns={columns}
          dataSource={activityLogs}
          scroll={{ x: "1500px" }}
          onChange={handlePageSize}
        />
      </div>
    </div>
  );
}
