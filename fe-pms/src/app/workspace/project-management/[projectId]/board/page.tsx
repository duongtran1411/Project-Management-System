"use client";

import CreateTaskInput from "@/components/common/modal/createTask";
import DeleteTaskModal from "@/components/common/modal/deleteTask";
import MileStoneskModal from "@/components/common/modal/mileStoneModal";
import Spinner from "@/components/common/spinner/spin";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import {
  createTaskBoard,
  deleteOneTask,
  updateAssigneeTask,
  updateEpicTask,
  updateMileStoneForTasks,
  updateTaskStatus,
} from "@/lib/services/task/task.service";
import { Epic } from "@/models/epic/epic.model";
import { Milestone } from "@/models/milestone/milestone.model";
import { ProjectContributorTag } from "@/models/projectcontributor/project.contributor.model";
import { Task } from "@/models/task/task.model";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DownOutlined,
  EditOutlined,
  FileDoneOutlined,
  FlagOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Checkbox, Dropdown, Input, Tooltip } from "antd";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import useSWR from "swr";
import DetailTaskModal from "./detail-task/page";
import { useRole } from "@/lib/auth/auth-project-context";

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
  const [epicOpen, setEpicOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskDel, setSelectedTaskDel] = useState<Task | null>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [contributors, setContributors] = useState<ProjectContributorTag[]>([]);
  const [isOpenModalDel, setIsOpenModalDel] = useState<boolean>(false);
  const [milestones, setMileStones] = useState<Milestone[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [milestonesOpen, setMilestonesOpen] = useState<boolean>(false);
  const [isOpenMileStoneModal, setIsOpenMileStoneModal] =
    useState<boolean>(false);
  const [showCreateInput, setShowCreateInput] = useState(false);

  const { role } = useRole();

  const isReadOnly = role.name === "CONTRIBUTOR";

  const {
    data: taskData,
    error: taskError,
    isLoading,
    mutate: taskMutate,
  } = useSWR(
    `${Endpoints.Task.GET_TASK_BOARD_BY_PROJECT_ID(projectId)}`,
    fetcher
  );
  const { data: epicData, error: epicError } = useSWR(
    `${Endpoints.Epic.GET_BY_PROJECT(projectId)}`,
    fetcher
  );

  const { data: contributorData } = useSWR(
    projectId
      ? `${Endpoints.ProjectContributor.GET_USER_BY_PROJECT(projectId)}`
      : "",
    fetcher
  );

  const {
    data: mileStonesData,
    error: mileStonesError,

    mutate: mileStonesMutate,
  } = useSWR(
    projectId ? `${Endpoints.Milestone.GET_BY_ACTIVE(projectId)}` : "",
    fetcher
  );

  useEffect(() => {
    if (taskData) {
      setTasks(taskData);
    }
  }, [taskData]);

  useEffect(() => {
    if (mileStonesData) {
      setMileStones(mileStonesData);
    }
  }, [mileStonesData]);

  useEffect(() => {
    if (epicData) {
      setEpics(epicData);
    }
  }, [epicData]);

  const epicOptions = Array.isArray(epics)
    ? epics.map((epic: Epic) => ({
        label: epic.name,
        value: epic._id,
        id: epic._id,
      }))
    : [];

  const mileStoneOptions = Array.isArray(milestones)
    ? milestones.map((ms: Milestone) => ({
        label: ms.name,
        value: ms._id,
        id: ms._id,
      }))
    : [];

  useEffect(() => {
    if (contributorData) {
      setContributors(contributorData);
    }
  }, [contributorData]);

  const getTasksByStatus = (status: string) =>
    Array.isArray(tasks) ? tasks.filter((task) => task.status === status) : [];

  const filterTasks = (inputTasks: Task[]) => {
    return inputTasks.filter((task) => {
      if (!task) return false;

      const matchSearch =
        search.trim() === "" ||
        task.name?.toLowerCase().includes(search.toLowerCase());

      const matchEpic =
        selectedEpics.length === 0 ||
        (task.epic && selectedEpics.includes(task.epic._id));

      const matchAssignee =
        selectedAssignees.length === 0 ||
        (task.assignee && selectedAssignees.includes(task.assignee._id)) ||
        (selectedAssignees.includes("unassigned") && !task.assignee);
      const matchMilestone =
        selectedMilestones.length === 0 ||
        (task.milestones && selectedMilestones.includes(task.milestones._id));
      return matchSearch && matchEpic && matchAssignee && matchMilestone;
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
          key={epic.id}
          className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50"
        >
          <Checkbox
            checked={selectedEpics.includes(epic.id)}
            onChange={() =>
              setSelectedEpics((prev) =>
                prev.includes(epic.id)
                  ? prev.filter((e) => e !== epic.id)
                  : [...prev, epic.value]
              )
            }
          >
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
        taskMutate();
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
        taskMutate();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
    }
  };

  const hanldeUpadateStatus = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      taskMutate();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
    }
  };

  const handleUpdateEpic = async (taskId: string, epic: string) => {
    try {
      const response = await updateEpicTask(taskId, epic);
      if (response.success) {
        taskMutate();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await deleteOneTask(taskId);
      if (response.success) {
        showSuccessToast(response.message);
        setIsOpenModalDel(false);
        setSelectedTaskDel(null);
        taskMutate();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
    }
  };

  const overlayContributor = (
    <div className="p-4 ml-2 bg-white rounded-md shadow-lg">
      <Checkbox.Group
        value={selectedAssignees}
        onChange={setSelectedAssignees}
        className="flex flex-col  gap-2"
      >
        <Checkbox key="unassigned" value="unassigned">
          <Avatar
            src={<UserOutlined />}
            size="small"
            className="bg-gray-400 mr-1"
          />
          Unassigned
        </Checkbox>
        {Array.isArray(contributors) &&
          contributors.map((contributor) => (
            <Checkbox
              key={contributor.userId?._id}
              value={contributor?.userId?._id}
              className="flex flex-row items-center"
            >
              <Avatar
                src={contributor?.userId?.avatar}
                size="small"
                className="mr-1"
              />
              {contributor?.userId?.fullName}
            </Checkbox>
          ))}
      </Checkbox.Group>
    </div>
  );

  const overlayMilestones = (
    <div className="bg-white rounded-lg shadow-lg p-2 min-w-[220px]">
      {mileStoneOptions.map((ms) => (
        <div
          key={ms.id}
          className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50"
        >
          <Checkbox
            checked={selectedMilestones.includes(ms.id)}
            onChange={() =>
              setSelectedMilestones((prev) =>
                prev.includes(ms.id)
                  ? prev.filter((e) => e !== ms.id)
                  : [...prev, ms.value]
              )
            }
          >
            <span className="font-medium">{ms.label}</span>
          </Checkbox>
        </div>
      ))}
    </div>
  );

  const handleMileStone = async (
    milestoneId: string,
    mileStoneMoveId: string
  ) => {
    try {
      const response = await updateMileStoneForTasks(
        milestoneId,
        mileStoneMoveId
      );
      if (response.success) {
        setIsOpenMileStoneModal(false);
        setSelectedMilestones([]);
        taskMutate();
        mileStonesMutate();
        showSuccessToast(response.message);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
    }
  };

  if (epicError || taskError || mileStonesError) {
    showErrorToast(epicError || taskError || mileStonesError);
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 flex-row justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search board"
            allowClear
            className="w-[450px] h-[30px] board-search-input"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Dropdown popupRender={() => overlayContributor} trigger={["click"]}>
            <div className="cursor-pointer">
              <Avatar.Group
                size={30}
                max={{
                  count: 2,
                  style: { color: "#f56a00", backgroundColor: "#fde3cf" },
                }}
              >
                <Avatar src={contributors[0]?.userId?.avatar}></Avatar>
                {Array.isArray(contributors) && contributors.length > 0 && (
                  <Avatar
                    style={{
                      backgroundColor: "#f0f1f3",
                      color: "black",
                      fontSize: "12px",
                    }}
                  >
                    +{contributors.length}
                  </Avatar>
                )}
              </Avatar.Group>
            </div>
          </Dropdown>
          {milestones.length > 1 && (
            <Dropdown
              popupRender={() => overlayMilestones}
              trigger={["click"]}
              open={milestonesOpen}
              onOpenChange={setMilestonesOpen}
              className="board-epic-dropdown"
            >
              <Button className="flex items-center font-semibold text-gray-700">
                Milestone <DownOutlined className="ml-1" />
              </Button>
            </Dropdown>
          )}
          <Dropdown
            open={epicOpen}
            onOpenChange={setEpicOpen}
            popupRender={() => epicDropdown}
            trigger={["click"]}
            className="board-epic-dropdown"
          >
            <Button className="flex items-center font-semibold text-gray-700">
              Epic <DownOutlined className="ml-1" />
            </Button>
          </Dropdown>
          <Button
            type="text"
            onClick={() => {
              setSearch("");
              setSelectedEpics([]);
              setSelectedAssignees([]);
              setSelectedMilestones([]);
            }}
            className="font-semibold text-gray-600"
          >
            Clear Filters
          </Button>
        </div>
        <div>
          <Button
            disabled={isReadOnly}
            className="bg-blue-500 text-zinc-200"
            onClick={() => {
              setIsOpenMileStoneModal(true);
            }}
          >
            Complete MileStone
          </Button>
        </div>
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
                ignoreContainerClipping={false}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-w-[300px] bg-[#ECECEC] border border-gray-200 rounded-lg shadow-sm px-3 py-4 ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-700">
                          {col.title}
                        </h2>
                        <span className="text-gray-500">{filtered.length}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {filtered.map((task, idx) => (
                        <Draggable
                          draggableId={task._id ?? `${idx}`}
                          index={idx}
                          key={task._id}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              key={task._id}
                              className={`transition-shadow shadow-sm cursor-pointer hover:shadow-md group relative${
                                snapshot.isDragging
                                  ? "ring-2 ring-blue-400"
                                  : ""
                              }`}
                              styles={{ body: { padding: "12px" } }}
                              onClick={() => {
                                setSelectedTask(task);
                                setIsModalOpen(true);
                              }}
                            >
                              <div
                                className="absolute top-2 right-2 hidden group-hover:flex"
                                key={task._id}
                              >
                                <Dropdown
                                  trigger={["click"]}
                                  menu={{
                                    items: [
                                      {
                                        key: "change_status",
                                        label: "Change status",
                                        children: [
                                          {
                                            key: "status_TO_DO",
                                            label: (
                                              <span className="font-semibold bg-gray-300">
                                                TO_DO
                                              </span>
                                            ),
                                          },
                                          {
                                            key: "status_IN_PROGRESS",
                                            label: (
                                              <span className="font-semibold bg-purple-200">
                                                IN_PROGRESS
                                              </span>
                                            ),
                                          },
                                          {
                                            key: "status_DONE",
                                            label: (
                                              <span className="font-semibold bg-green-200">
                                                DONE
                                              </span>
                                            ),
                                          },
                                        ],
                                      },
                                      {
                                        key: "change_parent",
                                        label: "Change parent",
                                        disabled: true,
                                        children: Array.isArray(epics)
                                          ? epics.map((epic) => ({
                                              key: `parent_${epic._id}`,
                                              label: (
                                                <span className="font-medium text-purple-600">
                                                  {epic.name}
                                                </span>
                                              ),
                                            }))
                                          : [],
                                      },
                                      {
                                        key: "delete",
                                        label: "Delete",
                                        danger: true,
                                        disabled: true,
                                      },
                                    ],
                                    onClick: ({ key, domEvent }) => {
                                      domEvent.stopPropagation();
                                      if (key.startsWith("parent_")) {
                                        const epic = key.replace("parent_", "");
                                        handleUpdateEpic(
                                          task._id ? task._id : "",
                                          epic
                                        );
                                      } else if (key === "delete") {
                                        console.log("Delete task:", task._id);
                                        setSelectedTaskDel(task);
                                        setIsOpenModalDel(true);
                                      } else if (key.startsWith("status_")) {
                                        debugger;
                                        const status = key.replace(
                                          "status_",
                                          ""
                                        );
                                        console.log(
                                          "Update status:",
                                          status,
                                          "task:",
                                          task._id
                                        );
                                        hanldeUpadateStatus(
                                          task._id ? task._id : "",
                                          status
                                        );
                                      }
                                    },
                                  }}
                                >
                                  <Button
                                    type="text"
                                    icon={
                                      <MoreOutlined
                                        style={{ fontSize: "20px" }}
                                      />
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Dropdown>
                              </div>
                              <div className="space-y-2">
                                <p
                                  className={`text-gray-700 font-medium ${
                                    col.status === "DONE" ? "line-through" : ""
                                  }`}
                                >
                                  {task.name}
                                  <EditOutlined className="mx-1 hover:bg-gray-300" />
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={
                                      task.epic?.name
                                        ? "px-2 py-0.5 rounded text-xs font-medium bg-purple-100"
                                        : ""
                                    }
                                  >
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
                                                className="bg-gray-400"
                                              ></Avatar>
                                              <div>
                                                <p className="font-medium">
                                                  Unassigned
                                                </p>
                                              </div>
                                            </div>
                                          ),
                                        },
                                        ...contributors
                                          .filter((t) => {
                                            return (
                                              t.userId?._id !==
                                              task.assignee?._id
                                            );
                                          })
                                          .map((e) => ({
                                            key: e.userId?._id,
                                            label: (
                                              <div className="flex items-center gap-2">
                                                <Avatar
                                                  src={e.userId?.avatar}
                                                  size="small"
                                                >
                                                  {e.userId?.fullName[0]}
                                                </Avatar>
                                                <div>
                                                  <p className="font-medium">
                                                    {e.userId?.fullName}
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                    {e.userId?.email}
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
                                    trigger={["click"]}
                                    className="board-assignee-dropdown"
                                  >
                                    <Tooltip
                                      title={`Assignee: ${
                                        task.assignee?.fullName || "Unassigned"
                                      }`}
                                    >
                                      <Avatar
                                        className={`cursor-pointer text-white ${
                                          task.assignee?.fullName ===
                                          "Unassigned"
                                            ? "bg-gray-400"
                                            : ""
                                        }`}
                                        size="default"
                                        src={task.assignee?.avatar}
                                        onClick={(e) => e?.stopPropagation()}
                                      >
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
                    {col.status === "TO_DO" && (
                      <>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          className="!flex items-center"
                          onClick={() => setShowCreateInput(!showCreateInput)}
                        >
                          {showCreateInput ? "Close" : "Create"}
                        </Button>
                        {showCreateInput && (
                          <div className="mt-3">
                            <CreateTaskInput
                              onCreate={async (name, milestones) => {
                                console.log("Task created:", name);
                                setShowCreateInput(false);
                                await createTaskBoard(
                                  name,
                                  milestones,
                                  projectId
                                );
                                taskMutate(); // refresh board
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
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

      {selectedTaskDel && (
        <DeleteTaskModal
          open={isOpenModalDel}
          onCancel={() => {
            setIsOpenModalDel(false);
          }}
          onDelete={() => handleDeleteTask(selectedTaskDel._id || "")}
          task={selectedTaskDel}
        />
      )}

      <MileStoneskModal
        open={isOpenMileStoneModal}
        onCancel={() => {
          setIsOpenMileStoneModal(false);
        }}
        onSave={(mileStoneId: string, mileStoneMoveId: string) =>
          handleMileStone(mileStoneId, mileStoneMoveId)
        }
      />
    </div>
  );
};

export default BoardPage;
