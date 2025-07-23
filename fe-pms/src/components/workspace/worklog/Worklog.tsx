"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { Task } from "@/models/task/task.model";
import { Worklog } from "@/models/worklog/worklog";
import { Avatar, Button, Image } from "antd";

import dayjs from "dayjs";
import { useState } from "react";
import useSWR from "swr";
import { ModalCreateWorklog } from "./ModalCreateWorklog";
import { ModalDeleteWorklog } from "./ModalDeleteWorklog";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

export const WorklogComponent: React.FC<{ task: Task }> = ({ task }) => {
  const { userInfo } = useAuth();
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingWorklog, setEditingWorklog] = useState<Worklog | null>(null);
  const [selectedWorklogId, setSelectedWorklogId] = useState<string | null>(
    null
  );
  const [workLogForm, setWorkLogForm] = useState({
    timeSpent: "",
    timeRemaining: "",
    dateStarted: dayjs(),
    description: "",
  });

  // Helper function to reset form
  const resetForm = () => {
    setWorkLogForm({
      timeSpent: "",
      timeRemaining: "",
      dateStarted: dayjs(),
      description: "",
    });
    setEditingWorklog(null);
  };

  const { data: worklogData, mutate: mutateWorklog } = useSWR(
    task._id ? Endpoints.Worklog.GET_BY_TASK(task._id) : null,
    fetcher
  );

  const ownerWorklog = worklogData?.data?.some(
    (worklog: Worklog) => worklog.contributor?._id === userInfo?.userId
  );

  // Helper function to handle edit worklog
  const handleEditWorklog = (worklog: Worklog) => {
    setEditingWorklog(worklog);
    setWorkLogForm({
      timeSpent: worklog.timeSpent ? `${worklog.timeSpent}h` : "",
      timeRemaining: worklog.timeRemain ? `${worklog.timeRemain}h` : "",
      dateStarted: worklog.startDate ? dayjs(worklog.startDate) : dayjs(),
      description: worklog.description || "",
    });
    setShowWorkLogModal(true);
  };

  // Helper function to handle delete worklog
  const handleDeleteWorklog = (worklogId: string) => {
    setSelectedWorklogId(worklogId);
    setShowDeleteModal(true);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 max-w-[400px] ">
      {!worklogData?.data || worklogData?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/clock-5.png"
            alt="Work log"
            className=" mb-4"
            style={{ width: 120, height: 120, objectFit: "contain" }}
          />
          <p className="m-6 text-gray-500 text-center text-xs">
            No time was logged for this Task yet. Logging time lets you track
            and report on the time spent on the work.
          </p>
          <Button
            type="link"
            onClick={() => {
              resetForm();
              setShowWorkLogModal(true);
            }}
          >
            <span className="font-semibold text-blue-400 font-charlie">
              Log time
            </span>
          </Button>
        </div>
      ) : (
        <div className="w-full">
          {worklogData &&
            worklogData?.data?.map((worklog: Worklog, index: number) => (
              <div
                key={worklog._id || index}
                className="mb-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  {worklog.contributor?.avatar ? (
                    <Avatar
                      size={25}
                      className=" text-white font-semibold"
                      src={worklog.contributor?.avatar}
                    />
                  ) : (
                    <Avatar size={25} className=" text-white font-semibold">
                      U
                    </Avatar>
                  )}
                  <div className="flex-1 flex-col">
                    <div className="flex flex-col items-start space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {worklog.contributor?.fullName || "Unknown User"}
                      </span>
                      <span className="text-gray-500 text-xs">
                        logged {worklog.timeSpent}h started at{" "}
                        {worklog?.startDate &&
                          formatDateTime(worklog?.startDate)}
                      </span>
                    </div>
                    <div className="text-gray-800 mb-2 ml-2">
                      {worklog.description || ""}
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      {ownerWorklog && (
                        <>
                          <Button
                            type="text"
                            size="small"
                            className="p-1 h-auto text-gray-600 font-semibold hover:text-blue-600"
                            onClick={() => handleEditWorklog(worklog)}
                          >
                            Edit
                          </Button>
                          <span className="text-gray-400">•</span>
                          <Button
                            type="text"
                            size="small"
                            className="p-1 h-auto text-gray-600 font-semibold hover:text-red-600"
                            onClick={() => handleDeleteWorklog(worklog._id!)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create Worklog Modal */}
      {task._id && (
        <ModalCreateWorklog
          taskId={task._id}
          workLogForm={workLogForm}
          setWorkLogForm={setWorkLogForm}
          editingWorklog={editingWorklog}
          mutateWorklog={mutateWorklog}
          resetForm={resetForm}
          setShowWorkLogModal={setShowWorkLogModal}
          showWorkLogModal={showWorkLogModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ModalDeleteWorklog
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        setSelectedWorklogId={setSelectedWorklogId}
        selectedWorklogId={selectedWorklogId}
        mutateWorklog={mutateWorklog}
      />
    </div>
  );
};
