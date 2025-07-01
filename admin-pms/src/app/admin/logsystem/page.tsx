"use client";
import { createStyles } from "@/components/common/antd/createStyle";
import { DataType } from "@/components/common/antd/datatype";
import Spinner from "@/components/common/spinner/spin";
import { showErrorToast } from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { ActivityLog } from "@/models/logsystem/Logsystem";
import { TokenPayload } from "@/models/user/TokenPayload";
import { Table, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { set } from "date-fns";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import useSWR from "swr";

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
    title: "Full Name",
    width: 150,
    key: "fullName",
    render: (record) => record.entityId.fullName || "-",
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
    }
  },
  { title: "Action", width: 100, dataIndex: "action", key: "action" },
  { title: "Device", width: 700, dataIndex: "userAgent", key: "userAgent" },
  {
    title: "Method",
    width: 150,
    key: "loginMethod",
    render: (record) => record.details?.loginMethod || "-",
  },
  {
    title: "Request Method",
    width: 100,
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
        <Tooltip title={url}>
          {url.slice(0, 27) + "..."}
        </Tooltip>
      ) : (
        url
      ),
  },
  {
    title: "Status",
    width: 100,
    fixed: 'right',
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
    }
  },
];

export default function Page() {
  const { customTable } = useStyle;
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
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

  const fetcher = async (url: string): Promise<ActivityLog[]> => {
    const response = await axiosService.getAxiosInstance().get(url);
    return response.data.data;
  };

  const { data, error, isLoading } = useSWR(
    userId ? `${Endpoints.ActivityLog.GET_ALL}?userId=${userId}` : "",
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
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">ACTIVITY LOGS</h2>
      <div className="flex justify-center items-center w-50">
        <Table
          size="small"
          rowKey={(record) => record._id}
          className={customTable}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: 10,
          }}
          style={{ padding: 30 }}
          columns={columns}
          dataSource={activityLogs}
          scroll={{ x: "1500px" }}
        />
      </div>
    </div>
  );
}
