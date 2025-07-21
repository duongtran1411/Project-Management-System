"use client";

import { Col, DatePicker, Input, Modal, Progress, Row, Typography } from "antd";

import { Worklog, WorklogModel } from "@/models/worklog/worklog";
import { useAuth } from "@/lib/auth/auth-context";
import {
  createWorklog,
  updateWorklog,
} from "@/lib/services/worklog/worklog.service";
interface Props {
  taskId: string;
  workLogForm: any;
  setWorkLogForm: (form: any) => void;
  editingWorklog: Worklog | null;
  mutateWorklog: () => void;
  resetForm: () => void;
  setShowWorkLogModal: (show: boolean) => void;
  showWorkLogModal: boolean;
}

export const ModalCreateWorklog: React.FC<Props> = ({
  taskId,
  resetForm,
  setShowWorkLogModal,
  showWorkLogModal,
  setWorkLogForm,
  workLogForm,
  editingWorklog,
  mutateWorklog,
}) => {
  const { userInfo } = useAuth();

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
      if (!taskId || !userInfo?.userId) {
        console.error("Missing task ID or user info");
        return;
      }

      const timeSpent = parseInt(workLogForm.timeSpent.replace(/[^0-9]/g, ""));
      const timeRemain = workLogForm.timeRemaining
        ? parseInt(workLogForm.timeRemaining.replace(/[^0-9]/g, ""))
        : undefined;

      const dataWorklog: WorklogModel = {
        taskId,
        timeSpent,
        timeRemain,
        startDate:
          workLogForm.dateStarted.toISOString() || new Date().toISOString(),
        description: workLogForm.description,
        contributor: userInfo.userId,
      };

      if (editingWorklog) {
        // Update existing worklog
        await updateWorklog(dataWorklog, editingWorklog._id!);
      } else {
        // Create new worklog
        await createWorklog(dataWorklog);
      }

      setShowWorkLogModal(false);
      resetForm();
      mutateWorklog();
    } catch (error) {
      console.error("Error saving worklog:", error);
    }
  };
  return (
    <Modal
      title={editingWorklog ? "Edit time tracking" : "Time tracking"}
      open={showWorkLogModal}
      onCancel={() => {
        setShowWorkLogModal(false);
        resetForm();
      }}
      onOk={handelSubmit}
      okText="Save"
      cancelText="Cancel"
      okButtonProps={{
        disabled: !workLogForm.timeSpent || !workLogForm.dateStarted,
      }}
      width={400}
    >
      <div style={{ padding: "8px 0" }}>
        {/* Progress Bar Section - Only show when time is entered */}
        {hasTimeInput && (
          <div style={{ marginBottom: "24px" }}>
            <Row justify="space-between" style={{ marginBottom: "8px" }}>
              <Col>
                <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                  {workLogForm.timeSpent} logged
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
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
                setWorkLogForm((f: any) => ({
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
                setWorkLogForm((f: any) => ({
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
                Date started <Typography.Text type="danger">*</Typography.Text>
              </Typography.Text>
            </div>
            <DatePicker
              showTime
              value={workLogForm.dateStarted}
              onChange={(date) =>
                setWorkLogForm((f: any) => ({
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
                setWorkLogForm((f: any) => ({
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
  );
};
