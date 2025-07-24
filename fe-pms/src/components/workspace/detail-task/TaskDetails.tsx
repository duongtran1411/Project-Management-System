"use client";

import { showWarningToast } from "@/components/common/toast/toast";
import { useRole } from "@/lib/auth/auth-project-context";
import { Assignee } from "@/models/assignee/assignee.model";
import { Epic } from "@/models/epic/epic.model";
import { ProjectContributorTag } from "@/models/projectcontributor/project.contributor.model";
import { Reporter } from "@/models/reporter/reporter.model";
import { Task } from "@/models/task/task.model";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, DatePicker, Dropdown, Select, Tag, Tooltip } from "antd";
import { format } from "date-fns";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import ChangeLabelInDetailTask from "../backlog/ChangeLabelInDetailTask";

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
  mutateTask: () => void;
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
  mutateTask,
}) => {
  const { role } = useRole();
  const isReadOnlyContributor = role.name === "CONTRIBUTOR";
  const isReadOnlyStakeholder = role.name === "STAKEHOLDER";
  const isDisabled = isReadOnlyContributor && isReadOnlyStakeholder;
  const { projectId } = useParams<{ projectId: string }>();
  const handleMenuClick = async ({ key }: { key: string }) => {
    const nextStatus = key as Status;
    onStatusChange(nextStatus);
  };

  const items = statusOptions[status].map((item) => ({
    key: item,
    label: <Tag color={statusColors[item]}>{item.replaceAll("_", " ")}</Tag>,
  }));

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="mb-4">
        <Dropdown
          menu={{
            items,
            onClick: handleMenuClick,
          }}
          trigger={["click"]}
          disabled={isReadOnlyStakeholder}
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

      <div className="space-y-4 text-sm">
        <h3 className="text-lg font-semibold text-gray-800">Details</h3>

        <div className="space-y-4">
          {/* Assignee */}
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-600">Assignee:</span>
            <Dropdown
              menu={{
                items: [
                  ...(task.assignee?._id
                    ? [
                        {
                          key: task.assignee?._id,
                          label: (
                            <div className="flex items-center gap-2 bg-gray-100">
                              <Avatar
                                src={task.assignee?.avatar}
                                size="small"
                              />
                              <div>
                                <p className="font-medium">
                                  {task.assignee?.fullName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {task.assignee?.email}
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
                    .filter((t) => t.userId?._id !== task.assignee?._id)
                    .map((e) => ({
                      key: e.userId?._id || "unknown",
                      label: (
                        <div className="flex items-center gap-2">
                          <Avatar src={e.userId?.avatar} size="small">
                            {e.userId?.fullName?.[0]}
                          </Avatar>
                          <div>
                            <p className="font-medium">{e.userId?.fullName}</p>
                            <p className="text-xs text-gray-400">
                              {e.userId?.email}
                            </p>
                          </div>
                        </div>
                      ),
                    })),
                ],
                onClick: ({ key }) => {
                  if (task?._id && key) {
                    onAssigneeChange(key);
                  }
                },
              }}
              trigger={["click"]}
              disabled={isReadOnlyStakeholder}
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
                  onClick={(e) => {
                    e?.stopPropagation();
                    if (isDisabled) {
                      showWarningToast(
                        "Bạn không có quyền cập nhật assignee cho task"
                      );
                    }
                  }}
                >
                  {assignee?.fullName?.[0] || <UserOutlined />}
                </Avatar>
                <p className="truncate">{assignee?.fullName || "Unassigned"}</p>
              </Tooltip>
            </Dropdown>
          </div>

          {/* Labels */}
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-600">Labels:</span>
            {/* <span className="truncate">{task.name || "None"}</span> */}
            <ChangeLabelInDetailTask
              taskId={task._id}
              labels={task.labels || []}
              mutateTask={mutateTask}
            />
          </div>

          {/* Parent */}
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-600">Parent:</span>
            <Select
              showSearch
              placeholder="Select epic"
              style={{
                width: "100%",
                pointerEvents: isDisabled ? "none" : "auto",
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
              value={epic?._id || null}
              onChange={(value) => {
                const selectedEpic = epics.find((e) => e._id === value);
                if (selectedEpic) {
                  onEpicChange(selectedEpic._id || "");
                }
                if (isDisabled) {
                  showWarningToast("Bạn không có quyền cập nhật epic cho task");
                }
              }}
              optionLabelProp="label"
              options={epics.map((epic) => ({
                value: epic._id || "",
                label: `${epic.name}`,
                children: (
                  <div className="flex gap-2 items-center">
                    <Tag color="purple">{epic.name}</Tag>
                  </div>
                ),
              }))}
              disabled={isReadOnlyStakeholder && isReadOnlyContributor}
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-600">Start Date:</span>
            <DatePicker
              value={startDate ? dayjs(startDate).startOf("day") : null}
              onChange={(date) => {
                onStartDateChange(date?.format("YYYY-MM-DD") ?? "");
              }}
              style={{ width: "100%" }}
              disabled={isReadOnlyContributor && isReadOnlyStakeholder}
            />
          </div>

          {/* Due Date */}
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-600">Due Date:</span>
            <DatePicker
              value={dueDate ? dayjs(dueDate).startOf("day") : null}
              onChange={(date) => {
                onDueDateChange(date?.format("YYYY-MM-DD") ?? "");
              }}
              style={{ width: "100%" }}
              disabled={isReadOnlyContributor && isReadOnlyStakeholder}
            />
          </div>

          {/* Sprint */}
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-600">Sprint:</span>
            <span className="text-blue-600 truncate">
              <Link href={`/workspace/project-management/${projectId}/backlog`}>
                {task.milestones?.name || "None"}
              </Link>
            </span>
          </div>

          {/* Reporter */}
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-600">Reporter:</span>
            <Dropdown
              menu={{
                items: [
                  ...(task.reporter?._id
                    ? [
                        {
                          key: task.reporter?._id,
                          label: (
                            <div className="flex items-center gap-2 bg-gray-100">
                              <Avatar
                                src={task.reporter?.avatar}
                                size="small"
                              />
                              <div>
                                <p className="font-medium">
                                  {task.reporter?.fullName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {task.reporter?.email}
                                </p>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...contributor
                    .filter((t) => t.userId?._id !== task.reporter?._id)
                    .map((e) => ({
                      key: e.userId?._id || "unknown",
                      label: (
                        <div className="flex items-center gap-2">
                          <Avatar src={e.userId?.avatar} size="small">
                            {e.userId?.fullName?.[0]}
                          </Avatar>
                          <div>
                            <p className="font-medium">{e.userId?.fullName}</p>
                            <p className="text-xs text-gray-400">
                              {e.userId?.email}
                            </p>
                          </div>
                        </div>
                      ),
                    })),
                ],
                onClick: ({ key }) => {
                  if (task?._id && key) {
                    onReporterChange(key);
                  }
                },
              }}
              trigger={["click"]}
              disabled={isReadOnlyContributor && isReadOnlyStakeholder}
            >
              <Tooltip
                title={`Reporter: ${reporter?.fullName || "Unassigned"}`}
                className="flex flex-row gap-x-2 hover:bg-gray-300 hover:rounded-2xl items-center hover:cursor-pointer"
              >
                <Avatar
                  className={`cursor-pointer text-white`}
                  size="default"
                  src={reporter?.avatar}
                  onClick={(e) => e?.stopPropagation()}
                >
                  {reporter?.fullName?.[0] || <UserOutlined />}
                </Avatar>
                <p className="truncate">
                  {reporter?.fullName ? reporter?.fullName : "Unassigned"}
                </p>
              </Tooltip>
            </Dropdown>
            <div className="mt-4 mb-2">
              <p className="text-[13px] p-1 ml-2 text-gray-500">
                Created at:{" "}
                {format(
                  new Date(task?.createdAt ? task.createdAt : ""),
                  "yyyy-MM-dd"
                )}
              </p>
              <p className="text-[13px] p-1 ml-2 text-gray-500">
                Updated at:{" "}
                {format(
                  new Date(task?.updatedAt ? task.updatedAt : ""),
                  "yyyy-MM-dd"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
