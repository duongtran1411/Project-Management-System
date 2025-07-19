"use client";

import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "@/styles/Timeline.scss";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale/en-US";

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

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const { Option } = Select;

const TimelinePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [events, setEvents] = useState<any[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<"week" | "month" | "quarter">(
    "month"
  );
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (!projectId) return;
    getMilestonesByProject(projectId).then((data) => {
      setMilestones(data);
    });
    getTasksByProject(projectId).then((data) => {
      if (!Array.isArray(data)) return;
      getEpicsByProject(projectId).then((epicList) => {
        setEpics(epicList);
        // Gom event cho calendar
        const sprintEvents = milestones.map((m) => ({
          title: m.name,
          start: new Date(m.startDate),
          end: new Date(m.endDate),
          allDay: true,
          resource: { type: "sprint" },
        }));
        const epicEvents = data.map((task: any) => ({
          title: task.name,
          start: task.startDate ? new Date(task.startDate) : new Date(),
          end: task.dueDate
            ? new Date(task.dueDate)
            : task.startDate
            ? new Date(task.startDate)
            : new Date(),
          allDay: true,
          resource: {
            type: "epic",
            epicId: task.epic?._id,
            epicName: epicList.find((e: Epic) => e._id === task.epic?._id)
              ?.name,
          },
        }));
        setEvents([...sprintEvents, ...epicEvents]);
      });
    });
  }, [projectId, milestones.length]);

  // Tạo Epic
  const handleCreateEpic = async (values: any) => {
    await createEpic({ ...values, projectId });
    setOpen(false);
    getEpicsByProject(projectId).then(setEpics);
    form.resetFields();
  };

  // Chuyển đổi view
  let calendarView: (typeof Views)[keyof typeof Views] = Views.MONTH;
  if (viewMode === "week") calendarView = Views.WEEK;
  if (viewMode === "quarter") calendarView = Views.MONTH; // react-big-calendar không có view quarter, dùng month thay thế

  // Custom event style
  const eventPropGetter = (event: any) => {
    if (event.resource?.type === "sprint") {
      return {
        style: {
          backgroundColor: "#1976d2",
          color: "#fff",
          borderRadius: 6,
          fontWeight: 600,
        },
      };
    }
    if (event.resource?.type === "epic") {
      return {
        style: { backgroundColor: "#b39ddb", color: "#fff", borderRadius: 6 },
      };
    }
    return {};
  };

  return (
    <div className="flex h-screen">
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
      {/* Calendar */}
      <div className="flex-1 p-4 bg-gray-50 h-full flex flex-col min-w-0 overflow-x-auto">
        <div className="flex gap-2 mb-2">
          <Button onClick={() => setDate(new Date())}>Today</Button>
          <Button
            onClick={() => setViewMode("week")}
            type={viewMode === "week" ? "primary" : "default"}
          >
            Week
          </Button>
          <Button
            onClick={() => setViewMode("month")}
            type={viewMode === "month" ? "primary" : "default"}
          >
            Month
          </Button>
          <Button
            onClick={() => setViewMode("quarter")}
            type={viewMode === "quarter" ? "primary" : "default"}
          >
            Quarters
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-x-auto">
          <div className="min-w-[1200px]" style={{ height: 600 }}>
            {" "}
            {/* Tùy chỉnh minWidth theo nhu cầu */}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              view={calendarView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventPropGetter}
              popup
              toolbar={false}
              selectable={false}
              views={[Views.WEEK, Views.MONTH]}
              components={{
                timeGutterHeader: () => null,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
