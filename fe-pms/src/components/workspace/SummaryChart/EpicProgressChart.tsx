"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { Progress, Tooltip } from "antd";
import { useParams } from "next/navigation";
import useSWR from "swr";

type Task = {
  key: string;
  title: string;
  done: number;
  inProgress: number;
  toDo: number;
};

const tasks: Task[] = [
  { key: "SCRUM-44", title: "CLIENT", done: 73, inProgress: 4, toDo: 23 },
  { key: "SCRUM-43", title: "BACKEND-API", done: 91, inProgress: 5, toDo: 4 },
  { key: "SCRUM-8", title: "SRS Document", done: 100, inProgress: 0, toDo: 0 },
];

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
    <div className="w-full max-w-xl space-y-6">
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

      {/* Tasks */}
      {tasks.map((task) => (
        <div key={task.key}>
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-purple-500">⚡</span>
            <span>{task.key}</span>
            <span className="text-gray-700">{task.title}</span>
          </div>

          <Tooltip
            placement="top"
            color="white"
            title={
              <div className="text-sm text-gray-700 p-2 ">
                <div className="font-semibold mb-1">{task.title}</div>
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
                  <span className="ml-auto">{task.toDo}</span>
                </div>
              </div>
            }
          >
            <Progress
              percent={task.done + task.inProgress}
              success={{ percent: task.done, strokeColor: "##6a9a24" }} // Tailwind green-600
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
