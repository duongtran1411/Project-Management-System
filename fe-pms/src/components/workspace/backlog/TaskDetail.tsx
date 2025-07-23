"use client";

import { formatDateTime } from "@/lib/utils";
import { Button, Input, Tag } from "antd";
import { useEffect, useState } from "react";
import { WorklogComponent } from "../worklog/Worklog";
import ChangeAssigneeInDetailTask from "./ChangeAssigneeInDetailTask";
import { ChangeDescription } from "./ChangeDescription";
import { ChangeDueDate } from "./ChangeDueDate";
import { ChangeName } from "./ChangeName";
import ChangePriority from "./ChangePriority";
import ChangeReporter from "./ChangeReporter";
import { ChangeStartDate } from "./ChangeStartDate";
import ChangeEpic from "./ChangeEpic";
import History from "../history/History";
import { ListWorklog } from "../worklog/ListWorklog";

interface TaskDetailProps {
  task: any | null;
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
  const [priority, setPriority] = useState<string | null>(task?.priority || "");
  const [assignee, setAssignee] = useState<any>(task?.assignee || null);
  const [epic, setEpic] = useState<string>(task?.epic?.name || "");
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
  const [activeTab, setActiveTab] = useState<
    "all" | "comments" | "history" | "worklog"
  >("comments");

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
      setPriority(task.priority || "");
      setAssignee(task?.assignee || null);
      setEpic(task?.epic?.name || "");
    }
  }, [task]);

  if (!task) return null;

  return (
    <div className=" mx-4 ">
      <div className="w-full">
        {/* ID */}
        <ChangeName
          task={task}
          name={name}
          setName={setName}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          mutateTask={mutateTask}
          onClose={onClose}
        />

        {/* Description */}
        <ChangeDescription
          task={task}
          description={description}
          setDescription={setDescription}
          mutateTask={mutateTask}
        />

        {/* Priority */}
        <div className="mb-4 flex items-center justify-content">
          <span className="mr-2 text-sm text-gray-500">Priority:</span>
          <ChangePriority
            taskId={task._id}
            priority={priority}
            mutateTask={mutateTask}
            setPriority={setPriority}
          />
        </div>

        {/* Detail */}
        <div className="w-full ">
          <div className=" p-4 space-y-5 text-sm border border-gray-200 rounded-md ">
            <h3 className="mb-2 text-lg font-semibold">Details</h3>

            <div className="grid grid-cols-2 gap-y-6 items-center">
              <span className="font-semibold text-gray-600 ">Assignee:</span>
              <div className="flex items-center space-x-2 ">
                <ChangeAssigneeInDetailTask
                  taskId={task._id}
                  assignee={assignee}
                  mutateTask={mutateTask}
                  setAssignee={setAssignee}
                />
              </div>
              {/* Labels */}
              <span className="font-semibold text-gray-600">Labels</span>
              {task.labels && task.labels?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((label: string) => (
                    <Tag color="blue" key={label}>
                      {label}
                    </Tag>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  <Tag color="blue">None</Tag>
                </div>
              )}

              {/* Epic */}
              <span className="font-semibold text-gray-600">Parents</span>

              <ChangeEpic
                taskId={task._id}
                epic={epic || "None"}
                mutateTask={mutateTask}
                setEpic={setEpic}
                milestoneId={task.milestonesId?._id}
              />

              {/* Start Date */}
              <span className="font-semibold text-gray-600">Start Date:</span>
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
              {/* Due date */}
              <span className="font-semibold text-gray-600">Due Date:</span>
              <ChangeDueDate
                task={task}
                startDate={startDate}
                setDueDate={setDueDate}
                dueDate={dueDate}
                mutateTask={mutateTask}
                isPickingDueDate={isPickingDueDate}
                setIsPickingDueDate={setIsPickingDueDate}
              />

              {/* Milestone */}
              <span className="font-semibold text-gray-600">Sprint:</span>
              <span className="text-blue-600 font-normal">
                {task.milestones?.name || "None"}
              </span>

              {/* Reporter */}
              <span className="font-semibold text-gray-600">Reporter</span>
              <div className="flex items-center space-x-2 ">
                <ChangeReporter
                  taskId={task._id}
                  reporter={reporter}
                  mutateTask={mutateTask}
                  setReporter={setReporter}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Create and Update Time */}
        <div className="mt-4 mb-2">
          <p className="text-[13px] p-1 ml-2 text-gray-500">
            Created at: {formatDateTime(task?.createdAt || "")}
          </p>
          <p className="text-[13px] p-1 ml-2 text-gray-500">
            Updated at: {formatDateTime(task?.updatedAt || "")}
          </p>
        </div>

        {/* Activity (Comments) */}
        <div className="pt-4">
          <h3 className="mb-2 font-semibold text-md">Activity</h3>

          {/* Tabs */}
          <div className="flex mb-2 space-x-2">
            <Button
              size="small"
              type={activeTab === "all" ? "primary" : "default"}
              onClick={() => setActiveTab("all")}
            >
              All
            </Button>
            <Button
              size="small"
              type={activeTab === "comments" ? "primary" : "default"}
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </Button>
            <Button
              size="small"
              type={activeTab === "history" ? "primary" : "default"}
              onClick={() => setActiveTab("history")}
            >
              History
            </Button>
            <Button
              size="small"
              type={activeTab === "worklog" ? "primary" : "default"}
              onClick={() => setActiveTab("worklog")}
            >
              Work log
            </Button>
          </div>

          {/* All */}
          {activeTab === "all" && (
            <>
              {task._id && <History taskId={task._id} />}
              <ListWorklog task={task} />
            </>
          )}

          {/* Activity Content */}
          {activeTab === "comments" && (
            <>
              {/* Comment Input */}
              <div className="mt-4">
                <Input.TextArea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 5 }}
                />
                <div className="flex mt-2 space-x-2">
                  <Button
                    type="primary"
                    size="small"
                    disabled={!newComment.trim()}
                  >
                    Save
                  </Button>
                  <Button size="small" onClick={() => setNewComment("")}>
                    Cancel
                  </Button>
                </div>
              </div>
              {/* Render Comments */}
              <div className="mt-6 space-y-4"></div>
            </>
          )}

          {/* History */}
          {activeTab === "history" && task._id && <History taskId={task._id} />}
          {/* Worklog */}
          {activeTab === "worklog" && <WorklogComponent task={task} />}
        </div>
      </div>
      {/* Thêm các trường khác nếu muốn */}
    </div>
  );
};

export default TaskDetail;
