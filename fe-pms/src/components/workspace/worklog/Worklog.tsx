"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { createWorklog } from "@/lib/services/worklog/worklog.service";
import { formatDateTime } from "@/lib/utils";
import { Task } from "@/models/task/task.model";
import { Worklog, WorklogModel } from "@/models/worklog/worklog";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Image,
  Input,
  Modal,
  Progress,
  Row,
  Typography,
} from "antd";

import dayjs from "dayjs";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

export const WorklogComponent: React.FC<{ task: Task }> = ({ task }) => {
  const { userInfo } = useAuth();
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [workLogForm, setWorkLogForm] = useState({
    timeSpent: "",
    timeRemaining: "",
    dateStarted: dayjs(),
    description: "",
  });

  const { data: worklogData, mutate: mutateWorklog } = useSWR(
    task._id ? Endpoints.Worklog.GET_BY_TASK(task._id) : null,
    fetcher
  );

  console.log("Worklog data:", worklogData);
  console.log("User info:", userInfo);

  const calculateProgress = () => {
    if (!workLogForm.timeSpent) return 0;

    const parseTime = (timeStr: string): number => {
      const validPattern = /^\d+[hdwm]$/;
      if (!validPattern.test(timeStr.trim())) {
        return -1; // Invalid format
      }

      const match = timeStr.trim().match(/^(\d+)([hdwm])$/);
      if (!match) return -1;

      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case "w":
          return value * 7 * 24 * 60; // weeks to minutes
        case "d":
          return value * 24 * 60; // days to minutes
        case "h":
          return value * 60; // hours to minutes
        case "m":
          return value; // minutes
        default:
          return -1;
      }
    };

    const spent = parseTime(workLogForm.timeSpent);
    if (spent === -1) return -1; // Invalid spent time format

    // If only spent time is entered, total = spent
    if (!workLogForm.timeRemaining) {
      return 100; // 100% because spent = total
    }

    const remaining = parseTime(workLogForm.timeRemaining);
    if (remaining === -1) return -1; // Invalid remaining time format

    const total = spent + remaining;
    return total > 0 ? (spent / total) * 100 : 0;
  };

  const hasTimeInput = workLogForm.timeSpent || workLogForm.timeRemaining;
  const progress = calculateProgress();

  const handelSubmit = async () => {
    try {
      if (!task._id || !userInfo?.userId) {
        console.error("Missing task ID or user info");
        return;
      }

      const timeSpent = parseInt(workLogForm.timeSpent.replace(/[^0-9]/g, ""));
      const timeRemaining = workLogForm.timeRemaining
        ? parseInt(workLogForm.timeRemaining.replace(/[^0-9]/g, ""))
        : undefined;

      const dataWorklog: WorklogModel = {
        taskId: task._id,
        timeSpent,
        timeRemaining,
        startDate:
          workLogForm.dateStarted.toISOString() || new Date().toISOString(),
        description: workLogForm.description,
        contributor: userInfo.userId,
      };

      await createWorklog(dataWorklog);
      setShowWorkLogModal(false);
      mutateWorklog();
    } catch (error) {
      console.error("Error creating worklog:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {!worklogData?.data || worklogData?.data?.length === 0 ? (
        <>
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
          <Button type="link" onClick={() => setShowWorkLogModal(true)}>
            <span className="font-semibold text-blue-400 font-charlie">
              Log time
            </span>
          </Button>
        </>
      ) : (
        <div className="w-full">
          {worklogData &&
            worklogData?.data?.map((worklog: Worklog, index: number) => (
              <div
                key={worklog._id || index}
                className="mb-4 p-4 bg-gray-100 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  {worklog.contributor?.avatar ? (
                    <Avatar
                      size={25}
                      className="bg-blue-500 text-white font-semibold"
                      src={worklog.contributor?.avatar}
                    />
                  ) : (
                    <Avatar
                      size={25}
                      className="bg-blue-500 text-white font-semibold"
                    >
                      U
                    </Avatar>
                  )}
                  <div className="flex-1 flex-col">
                    <div className="flex flex-col items-start space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {worklog.contributor?.fullName || "Unknown User"}
                      </span>
                      <span className="text-gray-500 text-xs">
                        logged {worklog.timeSpent}h from{" "}
                        {worklog?.startDate &&
                          formatDateTime(worklog?.startDate)}
                      </span>
                    </div>
                    <div className="text-gray-800 mb-2 ml-2">
                      {worklog.description || "No description"}
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Button
                        type="text"
                        size="small"
                        className="p-1 h-auto text-gray-600 font-semibold hover:text-blue-600"
                        onClick={() => setShowWorkLogModal(true)}
                      >
                        Edit
                      </Button>
                      <span className="text-gray-400">•</span>
                      <Button
                        type="text"
                        size="small"
                        className="p-1 h-auto text-gray-600 font-semibold hover:text-red-600"
                        onClick={() => {
                          // TODO: Implement delete worklog functionality
                          console.log("Delete worklog");
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      <Modal
        title="Time tracking"
        open={showWorkLogModal}
        onCancel={() => setShowWorkLogModal(false)}
        onOk={handelSubmit}
        okText="Save"
        cancelText="Cancel"
        okButtonProps={{
          disabled: !workLogForm.timeSpent || !workLogForm.dateStarted,
        }}
        width={500}
      >
        <div style={{ padding: "16px 0" }}>
          {/* Progress Bar Section - Only show when time is entered */}
          {hasTimeInput && (
            <div style={{ marginBottom: "24px" }}>
              <Row justify="space-between" style={{ marginBottom: "8px" }}>
                <Col>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: "12px" }}
                  >
                    {workLogForm.timeSpent} logged
                  </Typography.Text>
                </Col>
                <Col>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: "12px" }}
                  >
                    {workLogForm.timeRemaining} remaining
                  </Typography.Text>
                </Col>
              </Row>
              <Progress
                percent={progress}
                showInfo={false}
                strokeColor="#1890ff"
                trailColor="#f0f0f0"
                size="small"
              />
            </div>
          )}

          {/* Time Input Fields */}
          <Row gutter={16} style={{ marginBottom: "16px" }}>
            <Col span={12}>
              <div style={{ marginBottom: "4px" }}>
                <Typography.Text strong style={{ fontSize: "14px" }}>
                  Time spent
                </Typography.Text>
              </div>
              <Input
                value={workLogForm.timeSpent}
                onChange={(e) =>
                  setWorkLogForm((f) => ({
                    ...f,
                    timeSpent: e.target.value,
                  }))
                }
                size="middle"
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: "4px" }}>
                <Typography.Text strong style={{ fontSize: "14px" }}>
                  Time remaining
                  <Typography.Text
                    type="secondary"
                    style={{ marginLeft: "4px", cursor: "help" }}
                  >
                    ⓘ
                  </Typography.Text>
                </Typography.Text>
              </div>
              <Input
                value={workLogForm.timeRemaining}
                onChange={(e) =>
                  setWorkLogForm((f) => ({
                    ...f,
                    timeRemaining: e.target.value,
                  }))
                }
                size="middle"
              />
            </Col>
          </Row>

          {/* Time Format Help */}
          <div className="text-sm text-gray-600 my-4">
            <p>
              Use the format:{" "}
              <code className="font-mono text-gray-700">2w 4d 6h 45m</code>
            </p>
            <ul className="list-disc list-inside mt-1 text-gray-700">
              <li>
                <code>w</code> = weeks
              </li>
              <li>
                <code>d</code> = days
              </li>
              <li>
                <code>h</code> = hours
              </li>
              <li>
                <code>m</code> = minutes
              </li>
            </ul>
          </div>

          {/* Date Started - Only show when time is entered */}
          {hasTimeInput && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ marginBottom: "4px" }}>
                <Typography.Text strong style={{ fontSize: "14px" }}>
                  Date started{" "}
                  <Typography.Text type="danger">*</Typography.Text>
                </Typography.Text>
              </div>
              <DatePicker
                showTime
                value={workLogForm.dateStarted}
                onChange={(date) =>
                  setWorkLogForm((f) => ({
                    ...f,
                    dateStarted: date,
                  }))
                }
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                size="middle"
              />
            </div>
          )}

          {/* Work Description - Only show when time is entered */}
          {hasTimeInput && (
            <div>
              <div style={{ marginBottom: "4px" }}>
                <Typography.Text strong style={{ fontSize: "14px" }}>
                  Work description
                </Typography.Text>
              </div>
              <Input.TextArea
                value={workLogForm.description}
                onChange={(e) =>
                  setWorkLogForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Pro tip: Type / to add tables, images, code blocks, and more."
                rows={4}
                style={{ resize: "none" }}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
