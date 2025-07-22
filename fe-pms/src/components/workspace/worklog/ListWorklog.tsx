"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { formatDateTime } from "@/lib/utils";
import { Task } from "@/models/task/task.model";
import { Worklog } from "@/models/worklog/worklog";
import { Avatar } from "antd";
import useSWR from "swr";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

export const ListWorklog: React.FC<{ task: Task }> = ({ task }) => {
  const { data: worklogData } = useSWR(
    task._id ? Endpoints.Worklog.GET_BY_TASK(task._id) : null,
    fetcher
  );

  return (
    <>
      {worklogData &&
        worklogData?.data?.map((worklog: Worklog) => (
          <div
            key={worklog._id}
            className="mb-4 pt-4 mt-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              {worklog.contributor?.avatar ? (
                <Avatar
                  size={25}
                  className="text-white font-semibold"
                  src={worklog.contributor?.avatar}
                />
              ) : (
                <Avatar size={25} className="text-white font-semibold">
                  U
                </Avatar>
              )}
              <div className="flex-1 flex-col">
                <div className="flex flex-col items-start space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {worklog.contributor?.fullName || "Unknown User"}
                  </span>
                  <span className="text-gray-500 text-xs">
                    logged {worklog.timeSpent}h started at{" "}
                    {worklog.startDate && formatDateTime(worklog.startDate)}
                  </span>
                </div>
                <div className="text-gray-800 mb-2 ml-2">
                  {worklog.description || ""}
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};
