"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { Progress, Tooltip } from "antd";
import { useParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

export default function ProgressChartAnt() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: statisticsEpic } = useSWR(
    `${Endpoints.Statistics.STATISTIC_EPIC(projectId)}`,
    fetcher
  );

  return (
    <div className="w-full max-w-xl space-y-6 h-[200px] overflow-y-auto mt-6">
      {/* Tasks */}
      {statisticsEpic?.data?.epicStats.map((task: any) => (
        <div key={task.name}>
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-purple-500">⚡</span>

            <span className="text-gray-700">{task.epicName}</span>
          </div>

          <Tooltip
            placement="top"
            color="white"
            title={
              <div className="text-sm text-gray-700 p-2 ">
                <div className="font-semibold mb-1">{task.epicName}</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-3 bg-green-600 rounded-sm" />
                  <span>Done</span>
                  <span className="ml-auto">{task.done}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-3 bg-blue-500 rounded-sm" />
                  <span>In progress</span>
                  <span className="ml-auto">{task.inProgress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-3 bg-gray-400 rounded-sm" />
                  <span>To do</span>
                  <span className="ml-auto">{task.todo}</span>
                </div>
              </div>
            }
          >
            <Progress
              percent={task.donePercent + task.inProgressPercent}
              success={{ percent: task.donePercent, strokeColor: "#6a9a24" }}
              showInfo={true}
              percentPosition={{ align: "start", type: "inner" }}
              size={{ height: 23 }}
              strokeColor="#3b82f6" // Tailwind blue-500
              trailColor="#9ca3af" // Tailwind gray-400
              className="mt-2 rounded-sm"
              strokeLinecap="butt"
            />
          </Tooltip>

          {/* <div className="text-sm text-green-700 font-medium mt-1">
            {task.done}%
            {task.inProgress > 0 && (
              <span className="text-blue-600"> + {task.inProgress}%</span>
            )}
          </div> */}
        </div>
      ))}
    </div>
  );
}
