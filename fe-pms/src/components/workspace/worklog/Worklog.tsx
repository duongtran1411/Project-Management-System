"use client";

import { Task } from "@/models/task/task.model";
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

export const Worklog: React.FC<{ task: Task }> = ({ task }) => {
  console.log(task);
  const [workLog, setWorkLog] = useState<null | {
    user: { name: string; avatar?: string };
    timeSpent: string;
    timeRemaining: string;
    dateStarted: string;
    description: string;
  }>(null);

  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [workLogForm, setWorkLogForm] = useState({
    timeSpent: "",
    timeRemaining: "",
    dateStarted: dayjs(),
    description: "",
  });

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
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {!workLog ? (
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
            <span className="font-bold text-blue-400 font-charlie">
              Log time
            </span>
          </Button>
        </>
      ) : (
        <div className="w-full flex flex-col items-start">
          <div className="flex items-center mb-2">
            <Avatar src={workLog.user.avatar}>{workLog.user.name[0]}</Avatar>
            <span className="ml-2 font-semibold">{workLog.user.name}</span>
            <span className="ml-2 text-gray-500">
              logged {workLog.timeSpent} on {workLog.dateStarted}
            </span>
          </div>
          <div className="mb-2">{workLog.description}</div>
          {/* Nếu muốn cho phép sửa/xóa thì mở comment dưới */}
          {/* <Button size="small" onClick={() => setShowWorkLogModal(true)}>Edit</Button>
                  <Button size="small" danger onClick={() => setWorkLog(null)}>Delete</Button> */}
        </div>
      )}
      <Modal
        title="Time tracking"
        open={showWorkLogModal}
        onCancel={() => setShowWorkLogModal(false)}
        onOk={() => {
          setWorkLog({
            user: { name: "Nguyễn Thị Lan K17 HL", avatar: "" }, // Thay bằng user thực tế nếu có
            timeSpent: workLogForm.timeSpent,
            timeRemaining: workLogForm.timeRemaining,
            dateStarted: workLogForm.dateStarted.format("YYYY-MM-DD HH:mm"),
            description: workLogForm.description,
          });
          setShowWorkLogModal(false);
        }}
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
                placeholder="2h"
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
                placeholder="3h"
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
