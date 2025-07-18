"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Tag,
  Avatar,
  Button,
  Input,
  Select,
  Space,
  Tooltip,
  Dropdown,
} from "antd";
import {
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import axiosService from "@/lib/services/axios.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import useSWR from "swr";
import { ProjectContributorTag } from "@/models/projectcontributor/projectcontributor";
import { Comment } from "@/models/comment/comment";
import Spinner from "@/components/common/spinner/spin";
import { Task } from "@/types/types";
import { createComment } from "@/lib/services/comment/comment.service";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  updateAssigneeTask,
  updateDescriptionTask,
  updateEpicTask,
  updatePriorityTask,
  updateTaskDate,
  updateTaskName,
} from "@/lib/services/task/task";
import { Assignee } from "@/models/assignee/assignee";
import { Epic } from "@/models/epic/epic";
interface DetailTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

const DetailTaskModal: React.FC<DetailTaskModalProps> = ({
  open,
  onClose,
  task,
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>();
  const [contributor, setContributors] = useState<ProjectContributorTag[]>([]);
  const { projectId } = useParams<{ projectId: string }>();
  const [assignee, setAssignee] = useState<Assignee>();
  const [epics, setEpics] = useState<Epic[]>([]);
  const [epic, setEpic] = useState<Epic>();
  const [currentTask, setCurrentTask] = useState<Task | null>(task);
  const [startDate, setStartDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);
  const getMemberProject = async (
    url: string
  ): Promise<ProjectContributorTag[]> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "đã có lỗi xảy ra";
      if (errorMessage) showErrorToast(errorMessage);
    }
    return Promise.reject();
  };

  const { data, error, isLoading } = useSWR(
    projectId
      ? `${Endpoints.ProjectContributor.GET_USER_BY_PROJECT(projectId)}`
      : "",
    getMemberProject
  );

  const getCommentTask = async (url: string): Promise<Comment[]> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "đã có lỗi xảy ra";
      if (errorMessage) showErrorToast(errorMessage);
    }
    return Promise.reject();
  };
  const {
    data: dataComment,
    error: errorComment,
    isLoading: loadingComment,
  } = useSWR(
    task._id ? `${Endpoints.Comment.GET_COMMENT_BY_TASK(task._id)}` : "",
    getCommentTask
  );

  const getEpicTask = async (url: string): Promise<Epic[]> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "đã có lỗi xảy ra";
      if (errorMessage) showErrorToast(errorMessage);
    }
    return Promise.reject();
  };
  const {
    data: dataEpic,
    error: errorEpic,
    isLoading: loadingEpic,
  } = useSWR(
    projectId ? `${Endpoints.Epic.GET_BY_PROJECT(projectId)}` : "",
    getEpicTask
  );

  useEffect(() => {
    if (dataComment) {
      setComments(dataComment);
    }
  }, [dataComment]);

  useEffect(() => {
    if (data) {
      setContributors(data);
    }
  }, [data]);

  useEffect(() => {
    if (dataEpic) {
      setEpics(dataEpic);
    }
  }, [dataEpic]);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setPriority(task.priority || "Medium");
      setAssignee(task.assignee);
      setEpic(task.epic);
      setStartDate(task.startDate ?? "");
      setDueDate(task.dueDate ?? "");
      setName(task.name ?? "");
    }
  }, [task]);

  if (!task) return null;

  const handleSaveDescription = async () => {
    setIsEditingDescription(false);
    if (task._id) {
      const response = await updateDescriptionTask(task._id, description);
      if (response.success) {
        showSuccessToast(response.message);
      }
    }
  };

  const handleCancelDescription = () => {
    setDescription(task.description || "");
    setIsEditingDescription(false);
  };

  const handleSaveName = async () => {
    setIsEditingName(false);
    if (task._id) {
      const response = await updateTaskName(task._id, name);
      if (response.success) {
        showSuccessToast(response.message);
      }
    }
  };

  const handleCancelName = () => {
    setName(task.name || "");
    setIsEditingName(false);
  };

  const handleComment = async () => {
    try {
      const response = await createComment(
        task._id ? task._id : "",
        newComment
      );
      if (response.success) {
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };

  const priorityOptions = [
    { key: 'High',value: "HIGH", icon: <ArrowUpOutlined className="text-red-500" /> },
    { key: 'Medium',value: "MEDIUM", icon: <FlagOutlined className="text-yellow-500" /> },
    { key: 'Low',value: "LOW", icon: <ArrowDownOutlined className="text-blue-500" /> }
  ];

  const updateAssignee = async (taskId: string, assignee: string) => {
    try {
      const response = await updateAssigneeTask(taskId, assignee);
      if (response.success) {
        showSuccessToast(response.messsage);
        setAssignee(response.data.assignee);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
      return null;
    }
  };

  const updateEpic = async (epicId: string) => {
    try {
      const response = await updateEpicTask(task._id ? task._id : "", epicId);
      if (response.success) {
        showSuccessToast(response.message);
        setEpic(response.data.epic);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
      return null;
    }
  };

  const updateStartDateTask = async (date: string) => {
    try {
      const response = await updateTaskDate(task._id ? task._id : "", {
        startDate: date,
      });
      setStartDate(response.startDate);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
      return null;
    }
  };

  const updateDueDateTask = async (date: string) => {
    try {
      const response = await updateTaskDate(task._id ? task._id : "", {
        dueDate: date,
      });
      setDueDate(response.dueDate);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
      return null;
    }
  };

  const updatePriority = async (value:string)=>{
    debugger
    try {
      const response = await updatePriorityTask(task._id ? task._id : "",value);
      setDueDate(response.priority);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể lấy gán task đã giao!";
      showErrorToast(message);
      return null;
    }
  }

  if (error || errorComment) {
    showErrorToast(error ? error : errorComment);
  }

  if (isLoading || loadingComment) {
    return <Spinner />;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      styles={{ body: { padding: 0 } }}>
      <div className="flex">
        {/* Left section */}
        <div className="w-4/5 p-6 overflow-y-auto max-h-[500px]">
          {/* Title */}
          
            {isEditingName ? (
              <div>
                <Input.TextArea
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoSize={{ minRows: 3, maxRows: 10 }}
                />
                <div className="flex mt-2 space-x-2">
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSaveName}>
                    Save
                  </Button>
                  <Button size="small" onClick={handleCancelName}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="cursor-pointer min-h-[50px]">
                {name ? (
                  <h2 className="font-extrabold text-4xl">{name}</h2>
                ) : (
                  <p className="text-gray-500">Add a name...</p>
                )}
              </div>
            )}
          {/* Description */}
          <div className="mb-4">
            <h3 className="mb-2 text-xl font-semibold">Description</h3>
            {isEditingDescription ? (
              <div>
                <Input.TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  autoSize={{ minRows: 3, maxRows: 10 }}
                />
                <div className="flex mt-2 space-x-2">
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSaveDescription}>
                    Save
                  </Button>
                  <Button size="small" onClick={handleCancelDescription}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDescription(true)}
                className="cursor-pointer min-h-[50px]">
                {description ? (
                  <p className="text-gray-500">{description}</p>
                ) : (
                  <p className="text-gray-500">Add a description...</p>
                )}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="mb-4 flex justify-between items-center">
            <span className="mr-2 text-sm text-gray-500">Priority:</span>
            <Select
              value={priority}
              variant="borderless"
              style={{ width: 160 }}
              options={priorityOptions.map((opt) => ({
                label: (
                  <div className="flex gap-2">
                    {opt.icon}
                    <span>{opt.key}</span>
                  </div>
                ),
                value: opt.value,
              }))}
              onChange={(value) => {
                console.log('priority',value);
                setPriority(value)
                updatePriority(value)
              }}
            />
          </div>

          {/* Activity (Comments) */}
          <div className="pt-4 border-t">
            <h3 className="mb-2 font-semibold text-md">Activity</h3>

            {/* Tabs */}
            <div className="flex mb-2 space-x-2">
              <Button size="small">All</Button>
              <Button size="small" type="primary">
                Comments
              </Button>
              <Button size="small">History</Button>
              <Button size="small">Work log</Button>
            </div>

            {/* Comment Input */}
            <div className="mt-4">
              {/* Add mentions quick select */}
              {Array.isArray(contributor) && contributor.length > 0 && (
                <div className="mb-2 flex flex-wrap items-center">
                  <span className="mr-2">Add mentions:</span>
                  {contributor.map((e) => (
                    <Button
                      key={e._id}
                      size="small"
                      className="mr-2 mb-2 flex items-center"
                      icon={
                        <Avatar src={e.userId.avatar} size="small">
                          {e.userId.fullName[0]}
                        </Avatar>
                      }
                      onClick={() => {
                        const mention = `@${e.userId.fullName} `;
                        setNewComment((prev) => prev + mention);
                      }}>
                      {e.userId.fullName}
                    </Button>
                  ))}
                </div>
              )}

              <Input.TextArea
                placeholder="Add comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 5 }}
              />

              <div className="flex mt-2 space-x-2">
                <Button
                  type="primary"
                  size="small"
                  onClick={handleComment}
                  disabled={!newComment.trim()}>
                  Save
                </Button>
                <Button size="small" onClick={() => setNewComment("")}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Render Comments */}
            <div className="mt-4 space-y-3">
              {Array.isArray(comments) &&
                comments.map((c, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img
                      src={c.author.avatar}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{c.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {c.attachments?.filename}
                      </p>
                      <div
                        className="mt-1"
                        dangerouslySetInnerHTML={{ __html: c.content }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right section */}

        <div className="w-3/5 p-6">
          <div>
            <Tag color="purple" className="mb-2">
              {task.status || "None"}
            </Tag>
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
                            <p className="font-medium">Unassigned</p>
                          </div>
                        </div>
                      ),
                    },
                    ...contributor
                      .filter((t) => {
                        return t.userId._id !== task.assignee?._id;
                      })
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
                  onClick: ({ key, domEvent }) => {
                    domEvent.stopPropagation();
                    if (task._id && key) {
                      updateAssignee(task._id, key);
                    }
                  },
                }}
                trigger={["click"]}>
                <Tooltip
                  title={`Assignee: ${assignee?.fullName || "Unassigned"}`}
                  className="flex flex-row gap-x-2 hover:bg-gray-300 hover:rounded-2xl items-center hover:cursor-pointer">
                  <Avatar
                    className={`cursor-pointer text-white ${
                      assignee?.fullName === "Unassigned" ? "bg-gray-400" : ""
                    }`}
                    size="default"
                    src={assignee?.avatar}
                    onClick={(e) => e?.stopPropagation()}>
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
                  setCurrentTask((prev) =>
                    prev ? { ...prev, epic: selectedEpic } : null
                  );
                  if (selectedEpic) {
                    updateEpic(selectedEpic._id);
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
                    if (date && date.isBefore(dayjs().startOf("day"))) {
                      showErrorToast(
                        "Start Date không được nhỏ hơn ngày hiện tại"
                      );
                      return;
                    }
                    setStartDate(date?.format("YYYY-MM-DD") ?? "");
                    updateStartDateTask(date?.format("YYYY-MM-DD"));
                  }}
                />
              </Space>

              <span className="font-semibold text-gray-600">Due Date:</span>
              <Space direction="vertical">
                <DatePicker
                  value={dueDate ? dayjs(dueDate).startOf("day") : null}
                  onChange={(date) => {
                    if (date && date.isBefore(dayjs().startOf("day"))) {
                      showErrorToast(
                        "Start Date không được nhỏ hơn ngày hiện tại"
                      );
                      return;
                    }
                    setDueDate(date?.format("YYYY-MM-DD") ?? "");
                    updateDueDateTask(date?.format("YYYY-MM-DD"));
                  }}
                />
              </Space>

              <span className="font-semibold text-gray-600">Sprint:</span>
              <span className="text-blue-600">
                {task.milestones?.name || "None"}
              </span>
              <span className="font-semibold text-gray-600">Reporter:</span>
              <div className="flex items-center space-x-1">
                <Avatar src={task.createdBy?.avatar} className="mx-1" />{" "}
                <p>{task.createdBy?.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailTaskModal;
