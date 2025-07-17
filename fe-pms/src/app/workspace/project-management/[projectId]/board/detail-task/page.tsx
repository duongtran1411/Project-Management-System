"use client";

import React, { useState, useEffect } from "react";
import { Modal, Tag, Avatar, Button, Input, Select, Space } from "antd";
import {
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import axiosService from "@/lib/services/axios.service";
import { showErrorToast } from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import useSWR from "swr";
import { ProjectContributorTag } from "@/models/projectcontributor/projectcontributor";
import { Comment } from "@/models/comment/comment";
import Spinner from "@/components/common/spinner/spin";
import { Task } from "@/types/types";
import { createComment } from "@/lib/services/comment/comment.service";
import { DatePicker } from "antd";
import dayjs from "dayjs";
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
  const [contributor, setContributors] = useState<ProjectContributorTag[]>();
  const { projectId } = useParams<{ projectId: string }>();
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
    if (task) {
      setDescription(task.description || "");
      setPriority(task.priority || "Medium");
    }
  }, [task]);

  if (!task) return null;

  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    // Save description to server if needed
  };

  const handleCancelDescription = () => {
    setDescription(task.description || "");
    setIsEditingDescription(false);
  };

  // const handleAddComment = () => {
  //   if (!newComment.trim()) return;

  //   const newEntry = {
  //     author: "Giang",
  //     content: newComment.trim(),
  //     time: "Just now",
  //   };

  //   setCommentMap((prev) => ({
  //     ...prev,
  //     [task._id]: [newEntry, ...(prev[task._id] || [])],
  //   }));

  //   setNewComment("");
  // };

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
    {
      value: "Highest",
      icon: <ArrowUpOutlined className="text-red-500 rotate-45" />,
    },
    { value: "High", icon: <ArrowUpOutlined className="text-red-500" /> },
    { value: "Medium", icon: <FlagOutlined className="text-yellow-500" /> },
    { value: "Low", icon: <ArrowDownOutlined className="text-blue-500" /> },
    {
      value: "Lowest",
      icon: <ArrowDownOutlined className="text-blue-500 rotate-45" />,
    },
  ];
  console.log("task", task);

  const onChange = (date: string, dateString: string) => {
    console.log(date, dateString);
  };

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
          {/* ID */}
          <div className="flex items-center mb-8 text-sm text-gray-500">
            <span>{task._id}</span>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-3xl font-bold">{task.name}</h2>

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
          <div className="mb-4">
            <span className="mr-2 text-sm text-gray-500">Priority:</span>
            <Select
              value={priority}
              variant="borderless"
              style={{ width: 160 }}
              options={priorityOptions.map((opt) => ({
                label: (
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span>{opt.value}</span>
                  </div>
                ),
                value: opt.value,
              }))}
              onChange={(value) => setPriority(value)}
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
              <Select
                style={{ width: 210 }}
                value={task.assignee?.fullName || "unassigned"}
                onChange={(value) => {
                  console.log("Selected Assignee:", value);
                }}
                placeholder="Select assignee"
                optionLabelProp="label">
                {!task.assignee?._id && (
                  <Select.Option
                    key="unassigned"
                    value="unassigned"
                    label="Unassigned">
                    <div className="flex items-center space-x-2">
                      <Avatar icon={<UserOutlined />} size="small" />
                      <span>Unassigned</span>
                    </div>
                  </Select.Option>
                )}

                {contributor?.map((member) => (
                  <Select.Option
                    key={member.userId._id}
                    value={member.userId._id}
                    label={member.userId.fullName}>
                    <div className="flex items-center space-x-2">
                      <Avatar src={member.userId.avatar} size="small" />
                      <span>{member.userId.fullName}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>

              <span className="font-semibold text-gray-600">Labels:</span>
              <span>{task.name || "None"}</span>
              <span className="font-semibold text-gray-600">Parent:</span>
              <Tag color="purple">{task.epic?.name || "None"}</Tag>

              <span className="font-semibold text-gray-600">Start Date:</span>
              <Space direction="vertical">
                <DatePicker value={task.startDate ? dayjs(task.startDate) : undefined} />
              </Space>

              <span className="font-semibold text-gray-600">Due Date:</span>
              <Space direction="vertical">
                <DatePicker value={task.dueDate ? dayjs(task.dueDate) : undefined} />
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
