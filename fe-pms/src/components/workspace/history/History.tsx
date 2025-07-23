"use client";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { CheckSquareOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Avatar, Spin, Tag } from "antd";
import React from "react";
import useSWR from "swr";

const statusColorMap: Record<string, string> = {
  TO_DO: "gray",
  IN_PROGRESS: "blue",
  DONE: "green",
  BLOCKED: "red",
};

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const History: React.FC<{ taskId: string }> = ({ taskId }) => {
  const { data, error, isLoading } = useSWR(
    `${Endpoints.Task.GET_BY_ID(taskId)}`,
    fetcher
  );
  return (
    <div className="bg-white overflow-hidden h-auto">
      {isLoading ? (
        <div className="text-center text-gray-500 text-sm">
          <Spin size="large" tip="Loading...">
            <div className="p-10" />
          </Spin>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 text-sm">
          Failed to load history.
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {/* Updated By */}
          <div className="flex items-start gap-3 bg-gray-50 pt-4 my-3">
            {data?.data?.updatedBy?.avatar ? (
              <Avatar size="small" src={data?.data?.updatedBy?.avatar} />
            ) : (
              <Avatar className="bg-gray-400" size="small">
                U
              </Avatar>
            )}

            <div className="flex-1 text-sm">
              <p>
                <span className="font-medium">
                  {data?.data?.updatedBy?.fullName} updated on
                </span>
                <span className="rounded-[5px] break-words">
                  <span className="text-blue-700 font-medium px-2 py-1 rounded text-xs">
                    <CheckSquareOutlined className="text-blue-700 px-1" />
                    {data?.data?.name}
                  </span>{" "}
                  {data?.data?.status ? (
                    <Tag
                      color={statusColorMap[data?.data?.status] || "default"}
                      className="font-semibold text-xs"
                    >
                      {data?.data?.status.replace("_", " ")}
                    </Tag>
                  ) : (
                    <Tag color="default" className="font-semibold text-xs">
                      UNKNOWN
                    </Tag>
                  )}
                  <Tag color="gold" className="mx-2">
                    HISTORY
                  </Tag>
                </span>
              </p>
              <span className="text-gray-400 text-xs">
                <ClockCircleOutlined className="mr-1" />
                {`${data?.data?.updatedAt?.slice(
                  0,
                  10
                )} ${data?.data?.updatedAt?.slice(11, 19)}`}
              </span>
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-start gap-3 bg-gray-50 pt-4 my-3">
            {data?.data?.createdBy?.avatar ? (
              <Avatar size="small" src={data?.data?.createdBy?.avatar} />
            ) : (
              <Avatar className="bg-gray-400" size="small">
                U
              </Avatar>
            )}

            <div className="flex-1 text-sm">
              <p>
                <span className="font-medium">
                  {data?.data?.createdBy?.fullName} created on
                </span>
                <span className="rounded-[5px] break-words">
                  <span className="text-blue-700 font-medium px-2 py-1 rounded text-xs">
                    <CheckSquareOutlined className="text-blue-700 px-1" />
                    {data?.data?.name}
                  </span>{" "}
                  {data?.data?.status ? (
                    <Tag
                      color={statusColorMap[data?.data?.status] || "default"}
                      className="font-semibold text-xs"
                    >
                      {data?.data?.status.replace("_", " ")}
                    </Tag>
                  ) : (
                    <Tag color="default" className="font-semibold text-xs">
                      UNKNOWN
                    </Tag>
                  )}
                  <Tag color="gold" className="mx-2">
                    HISTORY
                  </Tag>
                </span>
              </p>

              <span className="text-gray-400 text-xs mt-2">
                <ClockCircleOutlined className="mr-1" />
                {`${data?.data?.createdAt?.slice(
                  0,
                  10
                )} ${data?.data?.createdAt?.slice(11, 19)}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
