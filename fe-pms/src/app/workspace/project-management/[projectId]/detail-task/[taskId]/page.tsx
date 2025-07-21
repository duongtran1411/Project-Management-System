"use client";

import { useEffect } from "react";
import { CommentSection } from "@/components/workspace/detail-task/CommentSection";
import { TaskDetails } from "@/components/workspace/detail-task/TaskDetails";
import { TaskHeader } from "@/components/workspace/detail-task/TaskHeader";
import { useSocket } from "@/hooks/useSocket";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useTaskData } from "@/hooks/useTaskData";
import { Endpoints } from "@/lib/endpoints";
import { useSWRConfig } from "swr";
import { useParams } from "next/navigation";
import useSWR from "swr";
import axiosService from "@/lib/services/axios.service";
import Spinner from "@/components/common/spinner/spin";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data.data);

const TaskDetail = () => {
  const { emit, connected } = useSocket();
  const { mutate } = useSWRConfig();
  const params = useParams();
  const taskId = params.taskId;

  const {
    data: taskData,
    error: taskError,
    isLoading: taskIsLoading,
  } = useSWR(
    taskId ? `${Endpoints.Task.GET_BY_ID(taskId?.toString())}` : "",
    fetcher
  );

  // Custom hook để quản lý task data
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
    onCommentAdded,
  } = useTaskData(taskData);

  useEffect(() => {
    if (!taskData?._id || !connected) return;
    emit("open-comment-task", taskData._id);
    return () => {
      emit("leave-comment-task", taskData._id);
    };
  }, [taskData?._id, emit, connected]);

  useSocketEvent(
    "new-comment",
    (data: any) => {
      if (data?.taskId === taskData?._id && taskData?._id) {
        mutate(`${Endpoints.Comment.GET_COMMENT_BY_TASK(taskData._id)}`);
        onCommentAdded();
      }
    },
    [taskData?._id]
  );

  if (taskIsLoading || isLoading) return <Spinner />;
  if (taskError || error) return <div>Error loading task</div>;
  if (!taskData) return <div>Task not found</div>;

  return (
    <div className="bg-zinc-50">
      <div className="flex">
        {/* Left section */}
        <div className="w-4/5 p-6 overflow-y-auto max-h-[500px]">
          <TaskHeader task={taskData} />
          <CommentSection
            taskId={taskData._id || ""}
            comments={comments}
            contributor={contributor}
            onCommentAdded={onCommentAdded}
          />
        </div>

        {/* Right section */}
        <div className="w-3/5 p-6">
          <TaskDetails
            task={taskData}
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
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
