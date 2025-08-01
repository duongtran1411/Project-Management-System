"use client";

import { useEffect } from "react";
import { Button, Modal } from "antd";
import { Task } from "@/models/task/task.model";
import { CommentSection } from "@/components/workspace/detail-task/CommentSection";
import { TaskDetails } from "@/components/workspace/detail-task/TaskDetails";
import { TaskHeader } from "@/components/workspace/detail-task/TaskHeader";
import { useSocket } from "@/hooks/useSocket";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useTaskData } from "@/hooks/useTaskData";
import { Endpoints } from "@/lib/endpoints";
import { mutate } from "swr";

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
  const { emit, connected } = useSocket();

  const {
    status,
    assignee,
    reporter,
    epic,
    epics,
    contributor,
    comments,
    startDate,
    dueDate,
    isLoading,
    error,
    onStatusChange,
    onAssigneeChange,
    onReporterChange,
    onEpicChange,
    onStartDateChange,
    onDueDateChange,
    onCommentAdded
  } = useTaskData(task);

  useEffect(() => {
    if (!open || !task?._id || !connected) return;
    emit("open-comment-task", task._id);
    return () => {
      emit("leave-comment-task", task._id);
    };
  }, [open, task?._id, emit, connected]);

  useSocketEvent(
    "new-comment",
    (data: any) => {
      if (data?.taskId === task._id && task._id) {
        mutate(`${Endpoints.Comment.GET_COMMENT_BY_TASK(task._id)}`);
        onCommentAdded();
      }
    },
    [task?._id]
  );

  if (!task || isLoading) return null;
  if (error) return <div>Error: {error}</div>;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="80vw"
      closable
      styles={{
        body: { padding: 0 },
        content: { maxHeight: "80vh" },
      }}>
      <div className="flex flex-col lg:flex-row h-[75vh] min-h-[300px]">
        {/* Left section - Comments */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200">
          <TaskHeader task={task} />
          <CommentSection
            task={task}
            taskId={task._id || ""}
            comments={comments}
            contributor={contributor}
            onCommentAdded={onCommentAdded}
          />
        </div>

        {/* Right section - Task Details */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <TaskDetails
            task={task}
            status={status}
            assignee={assignee}
            reporter={reporter}
            epic={epic}
            epics={epics}
            contributor={contributor}
            startDate={startDate}
            dueDate={dueDate}
            onStatusChange={onStatusChange}
            onAssigneeChange={onAssigneeChange}
            onReporterChange={onReporterChange}
            onEpicChange={onEpicChange}
            onStartDateChange={onStartDateChange}
            onDueDateChange={onDueDateChange}
            mutateTask={() => mutate(Endpoints.Task.GET_BY_ID(task._id ? task._id : ''))}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DetailTaskModal;
