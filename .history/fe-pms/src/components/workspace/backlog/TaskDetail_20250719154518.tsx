"use client";

import { formatDateTime } from "@/lib/utils";
import { Task } from "@/models/task/task.model";
import { Avatar, Button, Input, Tag } from "antd";
import { useEffect, useState } from "react";
import { ChangeDescription } from "./ChangeDescription";
import { ChangeDueDate } from "./ChangeDueDate";
import { ChangeName } from "./ChangeName";
import ChangeReporter from "./ChangeReporter";
import { ChangeStartDate } from "./ChangeStartDate";
import {
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  FlagOutlined,
  HistoryOutlined,
  CloseOutlined,
} from "@ant-design/icons";

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
  mutateTask: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onClose,
  mutateTask,
}) => {
  const [description, setDescription] = useState<string | null>(
    task?.description || ""
  );
  const [newComment, setNewComment] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(task?.dueDate || null);
  const [isPickingDueDate, setIsPickingDueDate] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(
    task?.startDate || null
  );
  const [isPickingStartDate, setIsPickingStartDate] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [reporter, setReporter] = useState(task?.reporter || null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState<string>(task?.name || "");

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setStartDate(task.startDate || null);
      setDueDate(task.dueDate || null);
      setIsPickingStartDate(false);
      setIsPickingDueDate(false);
      setDateError(null);
      setReporter(task.reporter || null);
      setName(task.name || "");
    }
  }, [task]);

  if (!task) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <ChangeName
          task={task}
          name={name}
          setName={setName}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          mutateTask={mutateTask}
          onClose={onClose}
        />
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          type="text"
          className="text-lg hover:text-red-500"
        />
      </div>

      {/* Priority */}
      <div className="mb-4 flex items-center gap-2">
        <FlagOutlined className="text-gray-400" />
        <span className="text-sm text-gray-500">Priority:</span>
        <Tag
          color={
            task.priority === "High"
              ? "red"
              : task.priority === "Medium"
              ? "orange"
              : task.priority === "Low"
              ? "blue"
              : "default"
          }
        >
          {task.priority || "None"}
        </Tag>
      </div>

      {/* Description */}
      <div className="mb-6">
        <ChangeDescription
          task={task}
          description={description}
          setDescription={setDescription}
          mutateTask={mutateTask}
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 border p-5 rounded-lg bg-gray-50 mb-6">
        {/* Assignee */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <UserOutlined /> Assignee:
        </div>
        <div className="flex items-center gap-2">
          {task.assignee?.avatar ? (
            <Avatar src={task.assignee.avatar} size="small" />
          ) : (
            <Avatar icon={<UserOutlined />} size="small" />
          )}
          <span>{task.assignee?.fullName || "Unassigned"}</span>
        </div>
        {/* Labels */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <TagOutlined /> Labels:
        </div>
        <div className="flex flex-wrap gap-1">
          {/* TODO: Render real labels if available */}
          <Tag color="blue">integrated</Tag>
        </div>
        {/* Epic */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <TagOutlined /> Parents:
        </div>
        <div className="flex flex-wrap gap-1">
          {task.epic?.name ? (
            <Tag color="purple">{task.epic.name}</Tag>
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
        {/* Start Date */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <CalendarOutlined /> Start Date:
        </div>
        <div>
          <ChangeStartDate
            task={task}
            startDate={startDate}
            setStartDate={setStartDate}
            dueDate={dueDate}
            dateError={dateError}
            setDateError={setDateError}
            mutateTask={mutateTask}
            isPickingStartDate={isPickingStartDate}
            setIsPickingStartDate={setIsPickingStartDate}
          />
        </div>
        {/* Due Date */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <CalendarOutlined /> Due Date:
        </div>
        <div>
          <ChangeDueDate
            task={task}
            startDate={startDate}
            setDueDate={setDueDate}
            dueDate={dueDate}
            mutateTask={mutateTask}
            isPickingDueDate={isPickingDueDate}
            setIsPickingDueDate={setIsPickingDueDate}
          />
        </div>
        {/* Milestone */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <TagOutlined /> Sprint:
        </div>
        <div className="text-blue-600">{task.milestones?.name || "None"}</div>
        {/* Reporter */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <UserOutlined /> Reporter:
        </div>
        <div className="flex items-center gap-2">
          <ChangeReporter
            taskId={task._id}
            reporter={reporter}
            mutateTask={mutateTask}
            setReporter={setReporter}
          />
        </div>
      </div>

      {/* Created/Updated */}
      <div className="flex gap-6 text-xs text-gray-400 mb-6">
        <span className="flex items-center gap-1">
          <CalendarOutlined /> Created: {formatDateTime(task.createdAt || "")}
        </span>
        <span className="flex items-center gap-1">
          <HistoryOutlined /> Updated: {formatDateTime(task.updatedAt || "")}
        </span>
      </div>

      {/* Activity (Comments) */}
      <div className="bg-gray-50 rounded-lg p-5">
        <h3 className="mb-3 font-semibold text-md">Activity</h3>
        {/* Tabs */}
        <div className="flex mb-3 space-x-2">
          <Button size="small">All</Button>
          <Button size="small" type="primary">
            Comments
          </Button>
          <Button size="small">History</Button>
          <Button size="small">Work log</Button>
        </div>
        {/* Comment Input */}
        <div className="flex items-start gap-2 mt-2">
          <Avatar size="small" className="mt-1" icon={<UserOutlined />} />
          <div className="flex-1">
            <Input.TextArea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 5 }}
              className="mb-2"
            />
            <div className="flex mt-1 space-x-2">
              <Button type="primary" size="small" disabled={!newComment.trim()}>
                Save
              </Button>
              <Button size="small" onClick={() => setNewComment("")}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
        {/* Render Comments */}
        <div className="mt-6 space-y-4">{/* TODO: Render comments here */}</div>
      </div>
    </div>
  );
};

export default TaskDetail;
