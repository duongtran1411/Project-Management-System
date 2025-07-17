"use client";

import { CloseOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, DatePicker, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { updateTask } from "@/lib/services/task/task";
import { Task } from "@/types/types";

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
  const [isEditingDescription, setIsEditingDescription] = useState(false);
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

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setStartDate(task.startDate || null);
      setDueDate(task.dueDate || null);
      setIsPickingStartDate(false);
      setIsPickingDueDate(false);
      setDateError(null);
    }
  }, [task]);

  if (!task) return null;

  const handleSaveDescription = async () => {
    setIsEditingDescription(false);

    try {
      if (!task._id) return;
      if (description) {
        const response = await updateTask(task._id, { description });
        if (response) setDescription(response.description);
        mutateTask();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartDateUpdate = async (date: string) => {
    try {
      if (!task._id) return;
      const response = await updateTask(task._id, { startDate: date });
      if (response?.startDate) {
        setStartDate(response.startDate);
      }
      mutateTask();
    } catch (error) {
      console.error("Error updating start date:", error);
    }
  };

  const handleDueDateUpdate = async (date: string) => {
    try {
      if (!task._id) return;
      const response = await updateTask(task._id, { dueDate: date });
      if (response?.dueDate) {
        setDueDate(response.dueDate);
      }
      mutateTask();
    } catch (error) {
      console.error("Error updating start date:", error);
    }
  };

  const handleCancelDescription = () => {
    setDescription(task.description || "");
    setIsEditingDescription(false);
  };

  return (
    <div className=" mx-4 ">
      <div className="w-full">
        {/* ID */}
        <div className="flex items-center justify-between mb-8 text-sm text-gray-500">
          {/* Title */}
          <h2 className="mb-2 text-2xl font-semibold">{task.name}</h2>
          <CloseOutlined onClick={onClose} />
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Description</h3>
          {isEditingDescription ? (
            <div>
              <Input.TextArea
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                autoSize={{ minRows: 3, maxRows: 10 }}
              />
              <div className="flex mt-2 space-x-2">
                <Button
                  type="primary"
                  size="small"
                  onClick={handleSaveDescription}
                >
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
              className="cursor-pointer min-h-[50px]"
            >
              {description ? (
                <p className="text-gray-500">{description}</p>
              ) : (
                <p className="text-gray-500">Add a description...</p>
              )}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="mb-4 flex items-center justify-content">
          <span className="mr-2 text-sm text-gray-500">Priority:</span>

          <span className="text-gray-600">{task.priority || "None"}</span>
        </div>

        {/* Detail */}
        <div className="w-full ">
          <div className=" p-4 space-y-5 text-sm border border-gray-200 rounded-md ">
            <h3 className="mb-2 text-lg font-semibold">Details</h3>

            <div className="grid grid-cols-2 gap-y-6 items-center">
              <span className="font-semibold text-gray-600 ">Assignee:</span>
              <div className="flex items-center space-x-2 ">
                {task.assignee?.avatar ? (
                  <div className="flex items-center gap-1 p-2">
                    <Avatar src={task.assignee?.avatar} size="small" />
                    <p className="text-sm">{task.assignee?.fullName}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <Avatar>U</Avatar>
                    <p>Unassignee</p>
                  </div>
                )}
              </div>
              {/* Labels */}
              <span className="font-semibold text-gray-600">Labels</span>
              <div className="flex flex-wrap gap-1">integrated</div>

              {/* Epic */}
              <span className="font-semibold text-gray-600">Parents</span>
              <div className="flex flex-wrap gap-1">
                <Tag color="purple">{task.epic?.name}</Tag>
              </div>

              {/* Start Date */}
              <span className="font-semibold text-gray-600">Start Date:</span>
              {!isPickingStartDate && (
                <span
                  className="text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-[3px] cursor-pointer"
                  onClick={() => setIsPickingStartDate(true)}
                >
                  {startDate?.slice(0, 10) || "Add start date"}
                </span>
              )}

              {isPickingStartDate && (
                <div className="mt-2">
                  <DatePicker
                    open
                    value={
                      startDate && typeof startDate === "string"
                        ? dayjs(startDate)
                        : undefined
                    }
                    onChange={(date, dateString) => {
                      const pickedDate = Array.isArray(dateString)
                        ? dateString[0]
                        : dateString;

                      if (
                        dueDate &&
                        dayjs(pickedDate).isAfter(dayjs(dueDate))
                      ) {
                        setDateError("Start date must be before due date");
                        setStartDate(task?.startDate || null); // reset lại nếu sai
                      } else {
                        setDateError(null);
                        if (typeof pickedDate === "string") {
                          setStartDate(pickedDate);
                          handleStartDateUpdate(pickedDate);
                        }
                        setIsPickingStartDate(false);
                      }
                    }}
                    onOpenChange={(open) => {
                      if (!open) setIsPickingStartDate(false);
                    }}
                  />
                  {dateError && (
                    <div className="text-red-500 text-xs mt-1">{dateError}</div>
                  )}
                </div>
              )}

              {/* Due date */}
              <span className="font-semibold text-gray-600">Due Date:</span>
              {!isPickingDueDate && (
                <span
                  className="text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-[3px] cursor-pointer"
                  onClick={() => setIsPickingDueDate(true)}
                >
                  {dueDate?.slice(0, 10) || "Add due date"}
                </span>
              )}

              {isPickingDueDate && (
                <div className="mt-2">
                  <DatePicker
                    open
                    value={
                      dueDate && typeof dueDate === "string"
                        ? dayjs(dueDate)
                        : undefined
                    }
                    onChange={(date, dateString) => {
                      const pickedDate = Array.isArray(dateString)
                        ? dateString[0]
                        : dateString;
                      if (
                        startDate &&
                        dayjs(pickedDate).isBefore(dayjs(startDate))
                      ) {
                        setDateError("Due date must be after start date");
                        setDueDate(task?.dueDate || null);
                      } else {
                        setDateError(null);
                        if (typeof pickedDate === "string") {
                          setDueDate(pickedDate);
                          handleDueDateUpdate(pickedDate);
                        }
                        setIsPickingDueDate(false);
                      }
                    }}
                    onOpenChange={(open) => {
                      if (!open) setIsPickingDueDate(false);
                    }}
                  />
                  {dateError && (
                    <div className="text-red-500 text-xs mt-1">{dateError}</div>
                  )}
                </div>
              )}

              <span className="font-semibold text-gray-600">Sprint:</span>
              <span className="text-blue-600">
                {task.milestones?.name || "None"}
              </span>

              {/* Reporter */}
              <span className="font-semibold text-gray-600">Reporter</span>
              <div className="flex items-center space-x-2 ">
                {task.reporter?.avatar ? (
                  <div className="flex items-center gap-1 p-2">
                    <Avatar src={task.reporter?.avatar} size="small" />
                    <p className="text-sm">{task.reporter?.fullName}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <Avatar>U</Avatar>
                    <p>Unassignee</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
            <Input.TextArea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 5 }}
            />
            <div className="flex mt-2 space-x-2">
              <Button type="primary" size="small" disabled={!newComment.trim()}>
                Save
              </Button>
              <Button size="small" onClick={() => setNewComment("")}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Render Comments */}
          <div className="mt-6 space-y-4"></div>
        </div>
      </div>
      {/* Thêm các trường khác nếu muốn */}
    </div>
  );
};

export default TaskDetail;
