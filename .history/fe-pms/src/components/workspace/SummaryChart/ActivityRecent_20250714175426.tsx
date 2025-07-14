"use client";
import { Endpoints } from "@/lib/endpoints";
import { Task } from "@/types/types";
import { CheckSquareOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Tag, Avatar, Spin } from "antd";
import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";

const statusColorMap: Record<string, string> = {
  TO_DO: "gray",
  IN_PROGRESS: "blue",
  DONE: "green",
  BLOCKED: "red",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const ActivityRecent = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );
  return (
    <div className="bg-white overflow-hidden h-[290px]">
      <h3 className="text-md font-semibold mb-1">Recent activity</h3>
      <p className="text-sm text-gray-500 mb-4">
        Stay up to date with what’s happening across the project.
      </p>

      {isLoading ? (
        <div className="text-center text-gray-500 text-sm">
          <Spin size="large" tip="Loading...">
            <div className="p-10" />
          </Spin>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 text-sm">
          Failed to load activities.
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {data?.data?.length === 0 ? (
            <p className="text-sm text-gray-400">No activities found.</p>
          ) : (
            data?.data.map((activity: Task) => (
              <div key={activity._id} className="flex items-start gap-3">
                {activity?.createdBy?.avatar ? (
                  <Avatar
                    className="bg-purple-700"
                    size="small"
                    src={activity.createdBy.avatar}
                  />
                ) : (
                  <Avatar className="bg-gray-400" size="small">
                    U
                  </Avatar>
                )}

                <div className="flex-1 text-sm">
                  <p>
                    <span className="font-medium">
                      {activity?.updatedBy?.fullName}
                    </span>
                    <span>
                      {activity.createdAt === activity.updatedAt
                        ? " created "
                        : " updated "}{" "}
                      on{" "}
                    </span>
                    <span className="rounded-[5px] break-words">
                      <span className="text-blue-700 font-medium px-2 py-1 rounded text-xs">
                        <CheckSquareOutlined className="text-blue-700 px-1" />
                        {activity?.name}
                      </span>{" "}
                      {activity.status ? (
                        <Tag
                          color={statusColorMap[activity.status] || "default"}
                          className="font-semibold text-xs"
                        >
                          {activity.status.replace("_", " ")}
                        </Tag>
                      ) : (
                        <Tag color="default" className="font-semibold text-xs">
                          UNKNOWN
                        </Tag>
                      )}
                    </span>
                  </p>
                  <span className="text-gray-400 text-xs">
                    <ClockCircleOutlined className="mr-1" />
                    {activity.createdAt === activity.updatedAt
                      ? `${activity?.createdAt.slice(
                          0,
                          10
                        )} ${activity?.createdAt.slice(11, 19)}`
                      : `${activity?.updatedAt.slice(
                          0,
                          10
                        )} ${activity?.updatedAt.slice(11, 19)}`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityRecent;
