"use client";

import {
  Avatar,
  DatePicker,
  Dropdown,
  Select,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Task } from "@/models/task/task.model";
import { Assignee } from "@/models/assignee/assignee.model";
import { Reporter } from "@/models/reporter/reporter.model";
import { Epic } from "@/models/epic/epic.model";
import { ProjectContributorTag } from "@/models/projectcontributor/project.contributor.model";
import dayjs from "dayjs";

type Status = "TO_DO" | "IN_PROGRESS" | "DONE";

const statusColors: Record<Status, string> = {
  TO_DO: "default",
  IN_PROGRESS: "blue",
  DONE: "green",
};

const statusOptions: Record<Status, Status[]> = {
  TO_DO: ["IN_PROGRESS", "DONE"],
  IN_PROGRESS: ["DONE", "TO_DO"],
  DONE: ["TO_DO", "IN_PROGRESS"],
};

interface TaskDetailsProps {
  task: Task;
  status: Status;
  assignee: Assignee | undefined;
  reporter: Reporter | undefined;
  epic: Epic | undefined;
  epics: Epic[];
  contributor: ProjectContributorTag[];
  startDate: string;
  dueDate: string;
  onStatusChange: (status: Status) => void;
  onAssigneeChange: (assigneeId: string) => void;
  onReporterChange: (reporterId: string) => void;
  onEpicChange: (epicId: string) => void;
  onStartDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  status,
  assignee,
  reporter,
  epic,
  epics,
  contributor,
  startDate,
  dueDate,
  onStatusChange,
  onAssigneeChange,
  onReporterChange,
  onEpicChange,
  onStartDateChange,
  onDueDateChange,
}) => {
  const handleMenuClick = async ({ key }: { key: string }) => {
    const nextStatus = key as Status;
    onStatusChange(nextStatus);
  };

  const items = statusOptions[status].map((item) => ({
    key: item,
    label: <Tag color={statusColors[item]}>{item.replaceAll("_", " ")}</Tag>,
  }));

  return (
    <div className="w-3/5 p-6 overflow-y-auto">
      <div className="mb-2">
        <Dropdown
          menu={{
            items,
            onClick: handleMenuClick,
          }}
          trigger={["click"]}
        >
          <Tag
            color={statusColors[status]}
            style={{
              cursor: "pointer",
              fontWeight: 600,
              padding: "6px 12px",
            }}
          >
            {status.replaceAll("_", " ")} <DownOutlined />
          </Tag>
        </Dropdown>
      </div>

      <div className="px-5 space-y-5 text-sm border border-gray-200 rounded-md py-7">
        <h3 className="mb-2 text-lg font-semibold">Details</h3>

        <div className="grid grid-cols-2 gap-y-5 gap-x-1">
          <span className="font-semibold text-gray-600">Assignee:</span>
          <Dropdown
            menu={{
              items: [
                ...(task.assignee?._id
                  ? [
                      {
                        key: task.assignee._id,
                        label: (
                          <div className="flex items-center gap-2 bg-gray-100">
                            <Avatar src={task.assignee.avatar} size="small" />
                            <div>
                              <p className="font-medium">
                                {task.assignee.fullName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {task.assignee.email}
                              </p>
                            </div>
                          </div>
                        ),
                      },
                    ]
                  : []),
                {
                  key: "unassigned",
                  label: (
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={<UserOutlined />}
                        size="small"
                        className="bg-gray-400"
                      />
                      <div>
                        <p className="font-medium">Unassigned</p>
                      </div>
                    </div>
                  ),
                },
                ...contributor
                  .filter((t) => t.userId._id !== task.assignee?._id)
                  .map((e) => ({
                    key: e.userId._id,
                    label: (
                      <div className="flex items-center gap-2">
                        <Avatar src={e.userId.avatar} size="small">
                          {e.userId.fullName[0]}
                        </Avatar>
                        <div>
                          <p className="font-medium">{e.userId.fullName}</p>
                          <p className="text-xs text-gray-400">
                            {e.userId.email}
                          </p>
                        </div>
                      </div>
                    ),
                  })),
              ],
              onClick: ({ key }) => {
                if (task._id && key) {
                  onAssigneeChange(key);
                }
              },
            }}
            trigger={["click"]}
          >
            <Tooltip
              title={`Assignee: ${assignee?.fullName || "Unassigned"}`}
              className="flex flex-row gap-x-2 hover:bg-gray-300 hover:rounded-2xl items-center hover:cursor-pointer"
            >
              <Avatar
                className={`cursor-pointer text-white ${
                  assignee?.fullName === "Unassigned" ? "bg-gray-400" : ""
                }`}
                size="default"
                src={assignee?.avatar}
              >
                {assignee?.fullName?.[0] || <UserOutlined />}
              </Avatar>
              <p>{assignee?.fullName}</p>
            </Tooltip>
          </Dropdown>

          <span className="font-semibold text-gray-600">Labels:</span>
          <span>{task.name || "None"}</span>

          <span className="font-semibold text-gray-600">Parent:</span>
          <Select
            showSearch
            placeholder="Select epic"
            style={{ width: "100%" }}
            value={epic?._id || null}
            onChange={(value) => {
              const selectedEpic = epics.find((e) => e._id === value);
              if (selectedEpic) {
                onEpicChange(selectedEpic._id);
              }
            }}
            optionLabelProp="label"
            options={epics.map((epic) => ({
              value: epic._id,
              label: `${epic.name}`,
              children: (
                <div className="flex gap-2 items-center">
                  <Tag color="purple">{epic.name}</Tag>
                </div>
              ),
            }))}
          />

          <span className="font-semibold text-gray-600">Start Date:</span>
          <Space direction="vertical">
            <DatePicker
              value={startDate ? dayjs(startDate).startOf("day") : null}
              onChange={(date) => {
                onStartDateChange(date?.format("YYYY-MM-DD") ?? "");
              }}
            />
          </Space>

          <span className="font-semibold text-gray-600">Due Date:</span>
          <Space direction="vertical">
            <DatePicker
              value={dueDate ? dayjs(dueDate).startOf("day") : null}
              onChange={(date) => {
                onDueDateChange(date?.format("YYYY-MM-DD") ?? "");
              }}
            />
          </Space>

          <span className="font-semibold text-gray-600">Sprint:</span>
          <span className="text-blue-600">
            {task.milestones?.name || "None"}
          </span>

          <span className="font-semibold text-gray-600">Reporter:</span>
          <Dropdown
            menu={{
              items: [
                ...(task.reporter?._id
                  ? [
                      {
                        key: task.reporter._id,
                        label: (
                          <div className="flex items-center gap-2 bg-gray-100">
                            <Avatar src={task.reporter.avatar} size="small" />
                            <div>
                              <p className="font-medium">
                                {task.reporter.fullName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {task.reporter.email}
                              </p>
                            </div>
                          </div>
                        ),
                      },
                    ]
                  : []),
                ...contributor
                  .filter((t) => t.userId._id !== task.reporter?._id)
                  .map((e) => ({
                    key: e.userId._id,
                    label: (
                      <div className="flex items-center gap-2">
                        <Avatar src={e.userId.avatar} size="small">
                          {e.userId.fullName[0]}
                        </Avatar>
                        <div>
                          <p className="font-medium">{e.userId.fullName}</p>
                          <p className="text-xs text-gray-400">
                            {e.userId.email}
                          </p>
                        </div>
                      </div>
                    ),
                  })),
              ],
              onClick: ({ key }) => {
                if (task._id && key) {
                  onReporterChange(key);
                }
              },
            }}
            trigger={["click"]}
          >
            <Tooltip
              title={`Reporter: ${reporter?.fullName || "Unassigned"}`}
              className="flex flex-row gap-x-2 hover:bg-gray-300 hover:rounded-2xl items-center hover:cursor-pointer"
            >
              <Avatar
                className={`cursor-pointer text-white`}
                size="default"
                src={reporter?.avatar}
              >
                {reporter?.fullName?.[0] || <UserOutlined />}
              </Avatar>
              <p>{reporter?.fullName ? reporter?.fullName : "Unassigned"}</p>
            </Tooltip>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
