"use client";

import React, { useEffect, useState } from "react";
import Timeline from "react-calendar-timeline";
import "@/styles/Timeline.scss";

import { getMilestonesByProject } from "@/lib/services/milestone/milestone.service";
import { getTasksByProject } from "@/lib/services/task/task.service";
import {
  getEpicsByProject,
  createEpic,
} from "@/lib/services/epic/epic.service";
import { useParams } from "next/navigation";
import { Milestone } from "@/models/milestone/milestone.model";
import { Epic } from "@/models/epic/epic.model";
import { Button, Form, Input, Select, Modal } from "antd";
import {
  addDays,
  addMonths,
  addQuarters,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
} from "date-fns";

const { Option } = Select;

const TimelinePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  // const [groups, setGroups] = useState<any[]>([]); // sprint
  const [items, setItems] = useState<any[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<"week" | "month" | "quarter">(
    "month"
  );

  // Load data
  useEffect(() => {
    if (!projectId) return;
    getMilestonesByProject(projectId).then((data) => {
      setMilestones(data);
      // setGroups(data.map((m) => ({ id: m._id, title: m.name }))); // không cần nữa
    });
    getTasksByProject(projectId).then((data) => {
      if (!Array.isArray(data)) return;
      setItems(
        data
          .map((task: any) => ({
            id: task._id,
            group:
              task.milestones && task.milestones._id
                ? task.milestones._id
                : undefined, // gán task vào sprint nếu có
            title: task.name,
            start_time: task.startDate
              ? new Date(task.startDate).getTime()
              : task.dueDate
              ? new Date(task.dueDate).getTime()
              : Date.now(),
            end_time: task.dueDate
              ? new Date(task.dueDate).getTime()
              : task.startDate
              ? new Date(task.startDate).getTime()
              : Date.now(),
          }))
          .filter((item: any) => !!item.group)
      );
    });
    getEpicsByProject(projectId).then(setEpics);
  }, [projectId]);

  // Tạo Epic
  const handleCreateEpic = async (values: any) => {
    await createEpic({ ...values, projectId });
    setOpen(false);
    getEpicsByProject(projectId).then(setEpics);
    form.resetFields();
  };

  const now = new Date();
  let visibleTimeStart = Date.now();
  let visibleTimeEnd = Date.now();

  if (viewMode === "week") {
    visibleTimeStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    visibleTimeEnd = addDays(visibleTimeStart, 7).getTime();
  } else if (viewMode === "month") {
    visibleTimeStart = startOfMonth(now).getTime();
    visibleTimeEnd = addMonths(visibleTimeStart, 1).getTime();
  } else if (viewMode === "quarter") {
    visibleTimeStart = startOfQuarter(now).getTime();
    visibleTimeEnd = addQuarters(visibleTimeStart, 1).getTime();
  }

  // Tính toán group dòng đầu cho sprint
  const sprintStart =
    milestones.length > 0
      ? Math.min(...milestones.map((m) => new Date(m.startDate).getTime()))
      : Date.now();
  const sprintEnd =
    milestones.length > 0
      ? Math.max(...milestones.map((m) => new Date(m.endDate).getTime()))
      : Date.now();

  // Group dòng đầu là Sprint tổng hợp
  const sprintGroup = [{ id: "sprint", title: "Sprints" }];
  // Các group tiếp theo là Epic
  const epicGroups = epics.map((epic) => ({ id: epic._id, title: epic.name }));
  const allGroups = [...sprintGroup, ...epicGroups];

  // Items dòng đầu: 1 item đại diện cho toàn bộ sprint
  const sprintItem = [
    {
      id: "sprint-item",
      group: "sprint",
      title: "Sprint",
      start_time: sprintStart,
      end_time: sprintEnd,
      style: { background: "#b39ddb", borderRadius: 6 },
    },
  ];
  // Items các dòng epic như cũ
  const epicItems = items.map((item: any) => ({ ...item, group: item.group }));
  const allItems = [...sprintItem, ...epicItems];

  return (
    <div className="flex h-screen">
      {" "}
      {/* full height */}
      {/* Sidebar tạo Epic */}
      <div className="w-64 border-r p-4 bg-white h-full flex flex-col">
        <h3 className="font-bold mb-2">Epics</h3>
        <ul className="mb-4">
          {epics.map((epic) => (
            <li key={epic._id} className="truncate">
              {epic.name}
            </li>
          ))}
        </ul>
        <Button type="primary" onClick={() => setOpen(true)} block>
          + Tạo Epic
        </Button>
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => form.submit()}
          title="Tạo Epic mới"
          okText="Tạo"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical" onFinish={handleCreateEpic}>
            <Form.Item
              name="name"
              label="Tên Epic"
              rules={[{ required: true }]}
            >
              {" "}
              <Input />{" "}
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              {" "}
              <Input.TextArea rows={2} />{" "}
            </Form.Item>
            <Form.Item name="milestonesId" label="Sprint">
              <Select allowClear placeholder="Chọn sprint">
                {milestones.map((m) => (
                  <Option key={m._id} value={m._id}>
                    {m.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      {/* Timeline */}
      <div className="flex-1 p-4 bg-gray-50 h-full flex flex-col">
        <div className="flex gap-2 mb-2">
          <Button
            onClick={() => setViewMode("week")}
            type={viewMode === "week" ? "primary" : "default"}
          >
            Tuần
          </Button>
          <Button
            onClick={() => setViewMode("month")}
            type={viewMode === "month" ? "primary" : "default"}
          >
            Tháng
          </Button>
          <Button
            onClick={() => setViewMode("quarter")}
            type={viewMode === "quarter" ? "primary" : "default"}
          >
            Quý
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <Timeline
            groups={allGroups}
            items={allItems}
            visibleTimeStart={visibleTimeStart}
            visibleTimeEnd={visibleTimeEnd}
            timeSteps={{
              second: 0,
              minute: 0,
              hour: 0,
              day: 1,
              month: 1,
              year: 1,
            }}
            groupRenderer={({ group }) => <span>{group.title}</span>}
            style={{ height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
