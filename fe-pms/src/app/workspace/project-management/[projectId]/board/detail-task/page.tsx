"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal, Tag, Avatar, Button, Input, Select, Mentions } from "antd";
import {
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FlagOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProjectContributor } from "@/models/projectcontributor/projectcontributor";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import { showErrorToast } from "@/components/common/toast/toast";
import axiosService from "@/lib/services/axios.service";
import { useParams } from "next/navigation";
import Spinner from "@/components/common/spinner/spin";
import { Option } from "antd/es/mentions";
import { createComment } from "@/lib/services/comment/comment.service";

interface Task {
  id: string;
  title: string;
  subtitle?: string;
  priority?: string;
  assignee?: string;
  parent?: string;
  dueDate?: string;
  sprint?: string;
  tags?: string[];
  storyPoints?: string | number;
}

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
  const [commentMap, setCommentMap] = useState<
    Record<string, { author: string; content: string; time: string }[]>
  >({});
  const [contributor, setContributors] = useState<ProjectContributor[]>();
  const { projectId } = useParams<{ projectId: string }>();
  const getMemberProject = async (
    url: string
  ): Promise<ProjectContributor[]> => {
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

  useEffect(() => {
    if (data) {
      setContributors(data);
    }
  }, [data]);

  useEffect(() => {
    if (task) {
      setDescription(task.subtitle || "");
      setPriority(task.priority || "Medium");
    }
  }, [task]);

  if (!task) return null;

  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    // Save description to server if needed
  };

  const handleCancelDescription = () => {
    setDescription(task.subtitle || "");
    setIsEditingDescription(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newEntry = {
      author: "Giang",
      content: newComment.trim(),
      time: "Just now",
    };

    setCommentMap((prev) => ({
      ...prev,
      [task.id]: [newEntry, ...(prev[task.id] || [])],
    }));

    setNewComment("");
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

  const handleComment = async () => {
    try {
      const response = await createComment(task.id,newComment);
      if(response.success){
        
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };

  if (error) {
    showErrorToast(error.message);
  }

  if (isLoading) {
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
        <div className="w-3/5 p-6 overflow-auto">
          {/* ID */}
          <div className="flex items-center mb-8 text-sm text-gray-500">
            <span>{task.id}</span>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-2xl font-semibold">{task.title}</h2>

          {/* Description */}
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">Description</h3>
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
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}>
                  Save
                </Button>
                <Button size="small" onClick={() => setNewComment("")}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right section */}

        <div className="w-2/5 p-6 ">
          <div className="px-5 space-y-5 text-sm border border-gray-200 rounded-md py-7">
            <h3 className="mb-2 text-lg font-semibold">Details</h3>

            <div className="grid grid-cols-2 gap-y-6">
              <span className="font-semibold text-gray-600">Assignee:</span>
              <div className="flex items-center space-x-2">
                <Avatar icon={<UserOutlined />} />
                <span>{task.assignee || "Unassigned"}</span>
              </div>

              <span className="font-semibold text-gray-600">Parent:</span>
              <Tag color="purple">{task.parent || "None"}</Tag>

              <span className="font-semibold text-gray-600">Due Date:</span>
              <span>{task.dueDate || "None"}</span>

              <span className="font-semibold text-gray-600">Sprint:</span>
              <span className="text-blue-600">{task.sprint || "None"}</span>

              <span className="font-semibold text-gray-600">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {task.tags &&
                  Array.isArray(task.tags) &&
                  ((task.tags || []).length > 0 ? (
                    task.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)
                  ) : (
                    <span>None</span>
                  ))}
              </div>

              <span className="font-semibold text-gray-600">Story Points:</span>
              <span>{task.storyPoints || "None"}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailTaskModal;
