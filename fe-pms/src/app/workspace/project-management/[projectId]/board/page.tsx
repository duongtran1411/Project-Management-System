"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Input,
  Dropdown,
  Checkbox,
  Spin,
  Alert,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DownOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  FlagOutlined,
  ArrowDownOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import DetailTaskModal from "./detail-task/page";
import { updateAssigneeTask, updateTaskStatus } from "@/lib/services/task/task";
import { Task } from "@/types/types";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import useSWR, { mutate } from "swr";
import { format } from "date-fns";
import { ProjectContributorTag } from "@/models/projectcontributor/projectcontributor";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data.data);

const reorderTasks = (tasks: Task[], sourceIdx: number, destIdx: number) => {
  const result = Array.from(tasks);
  const [removed] = result.splice(sourceIdx, 1);
  result.splice(destIdx, 0, removed);
  return result;
};

const moveTaskToStatus = (
  allTasks: Task[],
  taskId: string,
  newStatus: string
): Task[] => {
  return allTasks.map((task) =>
    task._id === taskId ? { ...task, status: newStatus } : task
  );
};

const BoardPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [search, setSearch] = useState("");
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [epicOpen, setEpicOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contributor, setContributor] = useState<ProjectContributorTag[]>([]);
  const {
    data: taskData,
    error: taskError,
    isLoading,
    mutate: taskMutate,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );

  const { data: epicData, error: epicError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );

  const { data: contributorData, error: contributorError } = useSWR(
    projectId
      ? `${Endpoints.ProjectContributor.GET_USER_BY_PROJECT(projectId)}`
      : "",
    fetcher
  );

  const epicOptions = (epicData?.data || []).map((epic: any) => ({
    label: epic.name,
    value: epic.name,
    id: epic._id,
  })) as { label: string; value: string; id: string }[];

  useEffect(() => {
    if (taskData) {
      setTasks(taskData);
    }
  }, [taskData]);

  useEffect(() => {
    if (contributorData) {
      setContributor(contributorData);
    }
  }, [contributorData]);

  const getTasksByStatus = (status: string) =>
    Array.isArray(tasks) ? tasks.filter((task) => task.status === status) : [];

  const filterTasks = (inputTasks: Task[]) => {
    return inputTasks.filter((task) => {
      if (!task) return false;

      const matchSearch =
        search.trim() === "" ||
        task.name?.toLowerCase().includes(search.toLowerCase()) ||
        task._id?.toLowerCase().includes(search.toLowerCase());

      const matchEpic =
        selectedEpics.length === 0 ||
        (Array.isArray(task.epic) &&
          task.epic.some((tag) => selectedEpics.includes(tag)));

      return matchSearch && matchEpic;
    });
  };
  const columnDefs = [
    { title: "TO DO", status: "TO_DO" },
    { title: "IN PROGRESS", status: "IN_PROGRESS" },
    {
      title: (
        <span className="flex items-center gap-2">
          DONE <FileDoneOutlined className="text-green-500" />
        </span>
      ),
      status: "DONE",
    },
  ];

  const epicDropdown = (
    <div className="bg-white rounded-lg shadow-lg p-2 min-w-[220px]">
      {epicOptions.map((epic) => (
        <div
          key={epic.value}
          className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50">
          <Checkbox
            checked={selectedEpics.includes(epic.value)}
            onChange={() =>
              setSelectedEpics((prev) =>
                prev.includes(epic.value)
                  ? prev.filter((e) => e !== epic.value)
                  : [...prev, epic.value]
              )
            }>
            <span className="font-medium">{epic.label}</span>
          </Checkbox>
        </div>
      ))}
    </div>
  );

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (sourceStatus === destStatus && source.index === destination.index)
      return;

    if (sourceStatus === destStatus) {
      const filtered = getTasksByStatus(sourceStatus);
      const reordered = reorderTasks(filtered, source.index, destination.index);
      const newTasks = [
        ...tasks.filter((t) => t.status !== sourceStatus),
        ...reordered.map((t) => ({ ...t, status: sourceStatus })),
      ];
      setTasks(newTasks);
    } else {
      const taskId = draggableId;
      const updatedTasks = moveTaskToStatus(tasks, taskId, destStatus);
      setTasks(updatedTasks);
      try {
        await updateTaskStatus(taskId, destStatus);
        mutate(
          `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_PROJECT(
            projectId
          )}`
        );
      } catch (error) {
        console.error("Failed to update task status:", error);
      }
    }
  };

  const renderPriority = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <ArrowUpOutlined className="text-red-500" />;
      case "MEDIUM":
        return <FlagOutlined className="text-yellow-500" />;
      case "LOW":
        return <ArrowDownOutlined className="text-blue-500" />;
      case "HIGHEST":
        return <ArrowUpOutlined className="text-red-500 rotate-45" />;
      case "LOWEST":
        return <ArrowDownOutlined className="text-blue-500 rotate-45" />;

      default:
        break;
    }
  };

  const updateAssignee = async (taskId: string, assignee: string) => {
    try {
      const response = await updateAssigneeTask(taskId, assignee);
      if (response.success) {
        showSuccessToast("Update assignee success");
        taskMutate();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading..." fullscreen />
      </div>
    );
  }

  if (epicError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert
          message="Error"
          description="Không thể tải danh sách Epic."
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (taskError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert
          message="Error"
          description="Không thể tải danh sách công việc."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Input.Search
          placeholder="Search board"
          allowClear
          className="w-[260px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Dropdown
          open={epicOpen}
          onOpenChange={setEpicOpen}
          popupRender={() => epicDropdown}
          trigger={["click"]}>
          <Button className="flex items-center font-semibold text-gray-700">
            Epic <DownOutlined className="ml-1" />
          </Button>
        </Dropdown>
        <Button
          type="text"
          onClick={() => {
            setSearch("");
            setSelectedEpics([]);
          }}
          className="font-semibold text-gray-600">
          Clear Filters
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4">
          {columnDefs.map((col) => {
            const filtered = filterTasks(getTasksByStatus(col.status));
            return (
              <Droppable
                droppableId={col.status}
                key={col.status}
                isDropDisabled={false}
                isCombineEnabled={false}
                ignoreContainerClipping={false}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-w-[300px] bg-[#ECECEC] border border-gray-200 rounded-lg shadow-sm px-3 py-4 ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-700">
                          {col.title}
                        </h2>
                        <span className="text-gray-500">{filtered.length}</span>
                      </div>
                      {col.status === "TO_DO" && (
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          className="!flex items-center">
                          Create
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {filtered.map((task, idx) => (
                        <Draggable
                          draggableId={task._id ?? `${idx}`}
                          index={idx}
                          key={task._id}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              key={task._id}
                              className={`transition-shadow shadow-sm cursor-pointer hover:shadow-md ${
                                snapshot.isDragging
                                  ? "ring-2 ring-blue-400"
                                  : ""
                              }`}
                              styles={{ body: { padding: "12px" } }}
                              onClick={() => {
                                setSelectedTask(task);
                                setIsModalOpen(true);
                              }}>
                              <div className="space-y-2">
                                <p
                                  className={`text-gray-700 font-medium ${
                                    col.status === "DONE" ? "line-through" : ""
                                  }`}>
                                  {task.name}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={
                                      task.epic?.name
                                        ? "px-2 py-0.5 rounded text-xs font-medium bg-purple-100"
                                        : ""
                                    }>
                                    {task.epic?.name}
                                  </span>
                                </div>
                                {task.dueDate ? (
                                  new Date(task.dueDate).getTime() <
                                  Date.now() ? (
                                    <div className="inline-flex items-center text-sm text-orange-300 border-2 border-orange-300 rounded px-2 py-1 gap-x-2">
                                      <ClockCircleOutlined />
                                      {format(
                                        new Date(task.dueDate),
                                        "dd/MM/yyyy"
                                      )}
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center text-sm text-gray-500 border-2 border-gray-300 rounded px-2 py-1 gap-x-2 font-semibold">
                                      <CalendarOutlined />
                                      {format(
                                        new Date(task.dueDate),
                                        "dd/MM/yyyy"
                                      )}
                                    </div>
                                  )
                                ) : null}

                                <div className="flex items-start justify-end gap-x-2">
                                  <Tooltip title={task.priority}>
                                    <span className="font-medium text-gray-600">
                                      {task.priority
                                        ? renderPriority(task.priority)
                                        : ""}
                                    </span>
                                  </Tooltip>
                                  <Dropdown
                                    menu={{
                                      items: [
                                        ...(task.assignee?._id
                                          ? [
                                              {
                                                key: task.assignee._id,
                                                label: (
                                                  <div className="flex items-center gap-2 bg-gray-100">
                                                    <Avatar
                                                      src={task.assignee.avatar}
                                                      size="small"
                                                    />
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
                                                className="bg-gray-400"></Avatar>
                                              <div>
                                                <p className="font-medium">
                                                  Unassigned
                                                </p>
                                              </div>
                                            </div>
                                          ),
                                        },
                                        ...contributor
                                          .filter((t) => {
                                            return (
                                              t.userId._id !==
                                              task.assignee?._id
                                            );
                                          })
                                          .map((e) => ({
                                            key: e.userId._id,
                                            label: (
                                              <div className="flex items-center gap-2">
                                                <Avatar
                                                  src={e.userId.avatar}
                                                  size="small">
                                                  {e.userId.fullName[0]}
                                                </Avatar>
                                                <div>
                                                  <p className="font-medium">
                                                    {e.userId.fullName}
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                    {e.userId.email}
                                                  </p>
                                                </div>
                                              </div>
                                            ),
                                          })),
                                      ],
                                      onClick: ({ key, domEvent }) => {
                                        setIsModalOpen(false);
                                        domEvent.stopPropagation();
                                        if (task._id && key) {
                                          updateAssignee(task._id, key);
                                        }
                                      },
                                    }}
                                    trigger={["click"]}>
                                    <Tooltip
                                      title={`Assignee: ${
                                        task.assignee?.fullName || "Unassigned"
                                      }`}>
                                      <Avatar
                                        className={`cursor-pointer text-white ${
                                          task.assignee?.fullName ===
                                          "Unassigned"
                                            ? "bg-gray-400"
                                            : ""
                                        }`}
                                        size="default"
                                        src={task.assignee?.avatar}
                                        onClick={(e) => e?.stopPropagation()}>
                                        {task.assignee?.fullName?.[0] || (
                                          <UserOutlined />
                                        )}
                                      </Avatar>
                                    </Tooltip>
                                  </Dropdown>
                                </div>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal chi tiết task */}
      {selectedTask && (
        <DetailTaskModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            taskMutate();
          }}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default BoardPage;
