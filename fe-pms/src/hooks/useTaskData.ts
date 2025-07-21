import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Task } from "@/models/task/task.model";
import { Comment } from "@/models/comment/comment";
import { Assignee } from "@/models/assignee/assignee.model";
import { Reporter } from "@/models/reporter/reporter.model";
import { Epic } from "@/models/epic/epic.model";
import { ProjectContributorTag } from "@/models/projectcontributor/project.contributor.model";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import {
  updateAssigneeTask,
  updateEpicTask,
  updateReporterForTask,
  updateTaskDate,
  updateTaskStatus,
} from "@/lib/services/task/task.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";

type Status = "TO_DO" | "IN_PROGRESS" | "DONE";

export const useTaskData = (task: Task | undefined) => {
  const { projectId } = useParams<{ projectId: string }>();

  // States
  const [status, setStatus] = useState<Status>(
    (task?.status as Status) || "TO_DO"
  );
  const [assignee, setAssignee] = useState<Assignee | undefined>(
    task?.assignee
  );
  const [reporter, setReporter] = useState<Reporter | undefined>(
    task?.reporter
  );
  const [epic, setEpic] = useState<Epic | undefined>(task?.epic);
  const [startDate, setStartDate] = useState<string>(task?.startDate ?? "");
  const [dueDate, setDueDate] = useState<string>(task?.dueDate ?? "");

  // API functions
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

  // SWR hooks
  const {
    data: contributor,
    error: contributorError,
    isLoading: contributorLoading,
  } = useSWR(
    projectId
      ? `${Endpoints.ProjectContributor.GET_USER_BY_PROJECT(projectId)}`
      : "",
    getMemberProject
  );

  const {
    data: comments,
    error: commentsError,
    isLoading: commentsLoading,
  } = useSWR(
    task?._id ? `${Endpoints.Comment.GET_COMMENT_BY_TASK(task._id)}` : "",
    getCommentTask,
    {
      refreshInterval: 5000, // Poll every 5 seconds as fallback
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const {
    data: epics,
    error: epicsError,
    isLoading: epicsLoading,
  } = useSWR(
    projectId ? `${Endpoints.Epic.GET_BY_PROJECT(projectId)}` : "",
    getEpicTask
  );

  // Update functions
  const onStatusChange = async (newStatus: Status) => {
    try {
      const response = await updateTaskStatus(task?._id || "", newStatus);
      setStatus(response.status as Status);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật status!";
      showErrorToast(message);
    }
  };

  const onAssigneeChange = async (assigneeId: string) => {
    try {
      const response = await updateAssigneeTask(task?._id || "", assigneeId);
      if (response.success) {
        setAssignee(response.data.assignee);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật assignee!";
      showErrorToast(message);
    }
  };

  const onReporterChange = async (reporterId: string) => {
    try {
      const response = await updateReporterForTask(task?._id || "", reporterId);
      if (response.success) {
        showSuccessToast(response.message);
        setReporter(response.data.reporter);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật reporter!";
      showErrorToast(message);
    }
  };

  const onEpicChange = async (epicId: string) => {
    try {
      const response = await updateEpicTask(task?._id || "", epicId);
      if (response.success) {
        setEpic(response.data.epic);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật epic!";
      showErrorToast(message);
    }
  };

  const onStartDateChange = async (date: string) => {
    try {
      const response = await updateTaskDate(task?._id || "", {
        startDate: date,
      });
      setStartDate(response.startDate);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật start date!";
      showErrorToast(message);
    }
  };

  const onDueDateChange = async (date: string) => {
    try {
      const response = await updateTaskDate(task?._id || "", { dueDate: date });
      setDueDate(response.dueDate);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật due date!";
      showErrorToast(message);
    }
  };

  const onCommentAdded = () => {
    // Trigger refetch comments
    // This will be handled by SWR mutate in CommentSection
  };

  // Update states when task changes
  useEffect(() => {
    if (task) {
      setStatus((task.status as Status) || "TO_DO");
      setAssignee(task.assignee);
      setReporter(task.reporter);
      setEpic(task.epic);
      setStartDate(task.startDate ?? "");
      setDueDate(task.dueDate ?? "");
    }
  }, [task]);

  return {
    status,
    assignee,
    reporter,
    epic,
    epics: epics || [],
    contributor: contributor || [],
    comments: comments || [],
    startDate,
    dueDate,
    isLoading: contributorLoading || commentsLoading || epicsLoading,
    error: contributorError || commentsError || epicsError,
    onStatusChange,
    onAssigneeChange,
    onReporterChange,
    onEpicChange,
    onStartDateChange,
    onDueDateChange,
    onCommentAdded,
  };
};
