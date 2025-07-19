"use client";

import {
  createEpic,
  getEpicsByProject,
} from "@/lib/services/epic/epic.service";
import { getMilestonesByProject } from "@/lib/services/milestone/milestone.service";
import { getTasksByProject } from "@/lib/services/task/task.service";
import { Epic } from "@/models/epic/epic.model";
import { Milestone } from "@/models/milestone/milestone.model";
import { Task } from "@/models/task/task.model";
import { Button, Form, Input, Modal, Select } from "antd";
import {
  addDays,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
} from "date-fns";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Option } = Select;

interface TimelineItem {
  id: string;
  name: string;
  type: "sprint" | "epic";
  startDate: Date;
  endDate: Date;
  status?: string;
  color: string;
}

interface EpicWithDates extends Epic {
  startDate?: Date;
  endDate?: Date;
  taskCount?: number;
}

const TimelinePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [epics, setEpics] = useState<Epic[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewRange, setViewRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  // Calculate view range (3 months)
  useEffect(() => {
    const start = startOfMonth(addDays(currentDate, -45));
    const end = endOfMonth(addDays(currentDate, 45));
    setViewRange({ start, end });
  }, [currentDate]);

  // Fetch data
  useEffect(() => {
    if (!projectId) return;

    Promise.all([
      getMilestonesByProject(projectId),
      getTasksByProject(projectId),
      getEpicsByProject(projectId),
    ]).then(([milestonesData, tasksData, epicsData]) => {
      setMilestones(milestonesData || []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setEpics(epicsData || []);
    });
  }, [projectId]);

  // Process timeline items
  useEffect(() => {
    const items: TimelineItem[] = [];

    // Add sprints
    milestones.forEach((milestone) => {
      items.push({
        id: milestone._id,
        name: milestone.name,
        type: "sprint",
        startDate: new Date(milestone.startDate),
        endDate: new Date(milestone.endDate),
        status: milestone.status,
        color: getSprintColor(milestone.status),
      });
    });

    // Add epics with calculated dates from tasks
    const epicsWithDates: EpicWithDates[] = epics.map((epic) => {
      const epicTasks = tasks.filter((task) => task.epic?._id === epic._id);

      if (epicTasks.length === 0) {
        return { ...epic, taskCount: 0 };
      }

      const dates = epicTasks
        .map((task) => ({
          start: task.startDate ? new Date(task.startDate) : null,
          end: task.dueDate ? new Date(task.dueDate) : null,
        }))
        .filter((d) => d.start || d.end);

      if (dates.length === 0) {
        return { ...epic, taskCount: epicTasks.length };
      }

      const startDate = dates
        .filter((d) => d.start)
        .reduce(
          (min, d) => (!min || d.start! < min ? d.start! : min),
          null as Date | null
        );

      const endDate = dates
        .filter((d) => d.end)
        .reduce(
          (max, d) => (!max || d.end! > max ? d.end! : max),
          null as Date | null
        );

      return {
        ...epic,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        taskCount: epicTasks.length,
      };
    });

    epicsWithDates
      .filter((epic) => epic.startDate && epic.endDate)
      .forEach((epic) => {
        items.push({
          id: epic._id,
          name: `${epic.name} (${epic.taskCount} tasks)`,
          type: "epic",
          startDate: epic.startDate!,
          endDate: epic.endDate!,
          color: "#9c27b0",
        });
      });

    setTimelineItems(items);
  }, [milestones, epics, tasks]);

  const getSprintColor = (status?: string) => {
    switch (status) {
      case "NOT_START":
        return "#9e9e9e";
      case "ACTIVE":
        return "#2196f3";
      case "COMPLETED":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  const handleCreateEpic = async (values: any) => {
    await createEpic({ ...values, projectId });
    setOpen(false);
    form.resetFields();
    // Refresh epics
    getEpicsByProject(projectId).then(setEpics);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => addDays(prev, direction === "next" ? 30 : -30));
  };

  // Generate timeline grid
  const timelineDays = eachDayOfInterval(viewRange);
  const totalDays = differenceInDays(viewRange.end, viewRange.start) + 1;

  const getItemPosition = (item: TimelineItem) => {
    const startOffset = Math.max(
      0,
      differenceInDays(item.startDate, viewRange.start)
    );
    const endOffset = Math.min(
      totalDays,
      differenceInDays(item.endDate, viewRange.start) + 1
    );
    const width = Math.max(1, endOffset - startOffset);

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(width / totalDays) * 100}%`,
    };
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
          <div className="min-w-[2000px]" style={{ height: 600 }}>
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
