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
  const projectId = params.projectId;

  // Fetch task data
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
    console.log("Socket connected:", connected);
    console.log("Task data:", taskData?._id);
    if (!taskData?._id || !connected) return;
    console.log("Joining comment room:", taskData._id);
    emit("open-comment-task", taskData._id);
    return () => {
      console.log("Leaving comment room:", taskData._id);
      emit("leave-comment-task", taskData._id);
    };
  }, [taskData?._id, emit, connected]);

  useSocketEvent(
    "new-comment",
    (data: any) => {
      console.log("Received new-comment event:", data);
      if (data?.taskId === taskData?._id && taskData?._id) {
        console.log("Mutating comments for task:", taskData._id);

        // Force revalidate với delay nhỏ để đảm bảo backend đã xử lý xong
        setTimeout(() => {
          // Mutate với force revalidate
          mutate(
            `${Endpoints.Comment.GET_COMMENT_BY_TASK(taskData._id)}`,
            undefined,
            {
              revalidate: true,
              rollbackOnError: false,
            }
          );

          // Mutate contributor nếu cần
          if (projectId && typeof projectId === "string") {
            mutate(
              `${Endpoints.ProjectContributor.GET_USER_BY_PROJECT(projectId)}`,
              undefined,
              {
                revalidate: true,
                rollbackOnError: false,
              }
            );
          }

          // Trigger callback
          onCommentAdded();

          // Force re-render bằng cách trigger một state change
          setTimeout(() => {
            mutate(`${Endpoints.Comment.GET_COMMENT_BY_TASK(taskData._id)}`);
          }, 200);
        }, 100);
      }
    },
    [taskData?._id, projectId]
  );

  if (taskIsLoading || isLoading) return <Spinner />;
  if (taskError || error) return <div>Error loading task</div>;
  if (!taskData) return <div>Task not found</div>;

  return (
    <div className="bg-zinc-50 h-full overflow-y-auto">
      <div className="flex h-full">
        {/* Left section */}
        <div className="flex-1 p-6">
          <TaskHeader task={taskData} />
          <CommentSection
            task={taskData}
            taskId={taskData._id || ""}
            comments={comments}
            contributor={contributor}
            onCommentAdded={onCommentAdded}
          />
        </div>

        {/* Right section */}
        <div className="w-96 p-6 border-l border-gray-200 bg-white">
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
