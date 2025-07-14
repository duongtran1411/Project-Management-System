"use client";
import { TaskStatistic } from "@/types/types";
import { CheckSquareOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Tag, Avatar } from "antd";
import React from "react";

const mockActivities = [
  {
    user: "Tran Dai Duong",
    avatar: "TD",
    field: "duedate",
    taskKey: "SCRUM-56",
    taskName: "Summary",
    status: "TO_DO",
    updatedAt: "about 5 hours ago",
  },
  {
    user: "Tran Dai Duong",
    avatar: "TD",
    field: "duedate",
    taskKey: "SCRUM-65",
    taskName: "API grant role for member",
    status: "TO_DO",
    updatedAt: "about 5 hours ago",
  },
  {
    user: "Tran Dai Duong",
    avatar: "TD",
    field: "IssueParentAssociation",
    taskKey: "SCRUM-63",
    taskName: "API CRUD Epic",
    status: "DONE",
    updatedAt: "about 5 hours ago",
  },
  {
    user: "Tran Dai Duong",
    avatar: "TD",
    field: "duedate",
    taskKey: "SCRUM-56",
    taskName: "Summary",
    status: "TO_DO",
    updatedAt: "about 5 hours ago",
  },
  {
    user: "Tran Dai Duong",
    avatar: "TD",
    field: "duedate",
    taskKey: "SCRUM-65",
    taskName: "API grant role for member",
    status: "TO_DO",
    updatedAt: "about 5 hours ago",
  },
  {
    user: "Tran Dai Duong",
    avatar: "TD",
    field: "IssueParentAssociation",
    taskKey: "SCRUM-63",
    taskName: "API CRUD Epic",
    status: "DONE",
    updatedAt: "about 5 hours ago",
  },
];

const statusColorMap: Record<string, string> = {
  TO_DO: "gray",
  IN_PROGRESS: "blue",
  DONE: "green",
  BLOCKED: "red",
};

interface Props {
  taskStatistic: TaskStatistic;
}

const ActivityRecent: React.FC<Props> = ({ taskStatistic }) => {
  return (
    <div className="bg-white  overflow-hidden h-[290px]">
      <h3 className="text-md font-semibold mb-1">Recent activity</h3>
      <p className="text-sm text-gray-500 mb-4">
        Stay up to date with what’s happening across the project.
      </p>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {mockActivities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <Avatar className="bg-purple-700" size="small">
              {activity.avatar}
            </Avatar>
            <div className="flex-1 text-sm">
              <p>
                <span className="font-medium">{activity.user}</span>
                <span> updated field "{activity.field}" on </span>
                <span className="rounded-[5px] break-words">
                  <span className=" text-blue-700 font-medium px-2 py-1 rounded text-xs ">
                    <CheckSquareOutlined className="text-blue-700 px-1" />
                    {activity.taskKey}: {activity.taskName}
                  </span>{" "}
                  <Tag
                    color={statusColorMap[activity.status]}
                    className=" font-semibold text-xs"
                  >
                    {activity.status.replace("_", " ")}
                  </Tag>
                </span>
              </p>
              <span className="text-gray-400 text-xs">
                <ClockCircleOutlined className="mr-1" />
                {activity.updatedAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityRecent;
