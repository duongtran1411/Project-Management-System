"use client";

import {
  createEpic,
  getEpicsByProject,
} from "@/lib/services/epic/epic.service";
import {
  getMilestonesByProject,
  updateMilestone,
} from "@/lib/services/milestone/milestone.service";
import {
  getTasksByProject,
  updateTaskDate,
} from "@/lib/services/task/task.service";
import { Epic } from "@/models/epic/epic.model";
import { Milestone } from "@/models/milestone/milestone.model";
import { Task } from "@/models/task/task.model";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Tooltip,
} from "antd";
import {
  addDays,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfDay,
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
}

const TimelinePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [epics, setEpics] = useState<Epic[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentDate] = useState(new Date());
  const [viewRange, setViewRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [viewMode, setViewMode] = useState<
    "today" | "week" | "month" | "quarters"
  >("month");
  const [showToday, setShowToday] = useState(false);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: "move" | "resize-left" | "resize-right" | null;
    itemId: string | null;
    startX: number;
    originalStartDate: Date | null;
    originalEndDate: Date | null;
  }>({
    isDragging: false,
    dragType: null,
    itemId: null,
    startX: 0,
    originalStartDate: null,
    originalEndDate: null,
  });

  // Calculate view range based on view mode
  useEffect(() => {
    let start: Date, end: Date;

    switch (viewMode) {
      case "today":
        start = addDays(currentDate, -1);
        end = addDays(currentDate, 1);
        break;
      case "week":
        start = addDays(currentDate, -21); // 3 weeks before
        end = addDays(currentDate, 21); // 3 weeks after
        break;
      case "month":
        start = startOfMonth(addDays(currentDate, -45));
        end = endOfMonth(addDays(currentDate, 45));
        break;
      case "quarters":
        start = addDays(currentDate, -180); // 6 months before
        end = addDays(currentDate, 180); // 6 months after
        break;
      default:
        start = startOfMonth(addDays(currentDate, -45));
        end = endOfMonth(addDays(currentDate, 45));
    }

    setViewRange({ start, end });
  }, [currentDate, viewMode]);

  // Fetch data
  useEffect(() => {
    if (!projectId) return;

    Promise.all([
      getMilestonesByProject(projectId),
      getTasksByProject(projectId),
      getEpicsByProject(projectId),
    ]).then(([milestonesData, tasksData, epicsData]) => {
      setMilestones(milestonesData || []);
      setTasks((tasksData || []) as Task[]);

      setEpics(epicsData || []);
    });
  }, [projectId]);

  // Process timeline items
  useEffect(() => {
    const items: TimelineItem[] = [];

    //Add sprints
    milestones.forEach((milestone) => {
      // Use default dates if not provided
      const startDate = milestone.startDate
        ? new Date(milestone.startDate)
        : new Date();
      const endDate = milestone.dueDate
        ? new Date(milestone.dueDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      items.push({
        id: milestone._id,
        name: milestone.name,
        type: "sprint",
        startDate: startDate,
        endDate: endDate,
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
          name: epic.name,
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

  const handleViewModeChange = (
    mode: "today" | "week" | "month" | "quarters"
  ) => {
    setViewMode(mode);
    setShowToday(mode === "today");
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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

  // Drag & Drop Helper Functions
  const snapToDay = (date: Date): Date => {
    return startOfDay(date);
  };

  // Drag Event Handlers
  const handleMouseDown = (
    e: React.MouseEvent,
    item: TimelineItem,
    dragType: "move" | "resize-left" | "resize-right"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDragState({
      isDragging: true,
      dragType,
      itemId: item.id,
      startX: e.clientX,
      originalStartDate: item.startDate,
      originalEndDate: item.endDate,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.itemId) return;

    const deltaX = e.clientX - dragState.startX;
    const containerWidth = 2000; // min-width of timeline
    const daysDelta = Math.round((deltaX / containerWidth) * totalDays);

    const updatedItems = timelineItems.map((item) => {
      if (item.id !== dragState.itemId) return item;

      let newStartDate = dragState.originalStartDate!;
      let newEndDate = dragState.originalEndDate!;

      switch (dragState.dragType) {
        case "move":
          newStartDate = snapToDay(
            addDays(dragState.originalStartDate!, daysDelta)
          );
          newEndDate = snapToDay(
            addDays(dragState.originalEndDate!, daysDelta)
          );
          break;
        case "resize-left":
          newStartDate = snapToDay(
            addDays(dragState.originalStartDate!, daysDelta)
          );
          // Ensure start date doesn't go past end date
          if (newStartDate >= newEndDate) {
            newStartDate = addDays(newEndDate, -1);
          }
          break;
        case "resize-right":
          newEndDate = snapToDay(
            addDays(dragState.originalEndDate!, daysDelta)
          );
          // Ensure end date doesn't go before start date
          if (newEndDate <= newStartDate) {
            newEndDate = addDays(newStartDate, 1);
          }
          break;
      }

      return { ...item, startDate: newStartDate, endDate: newEndDate };
    });

    setTimelineItems(updatedItems);
  };

  const handleMouseUp = async () => {
    if (!dragState.isDragging || !dragState.itemId) return;

    const draggedItem = timelineItems.find(
      (item) => item.id === dragState.itemId
    );
    if (!draggedItem) return;

    try {
      // Update via API based on item type
      if (draggedItem.type === "sprint") {
        const milestone = milestones.find((m) => m._id === draggedItem.id);
        if (milestone) {
          await updateMilestone({
            ...milestone,
            startDate: format(draggedItem.startDate, "yyyy-MM-dd"),
            dueDate: format(draggedItem.endDate, "yyyy-MM-dd"),
          });
        }
      } else if (draggedItem.type === "epic") {
        // For epics, we need to update all associated tasks
        const epicTasks = tasks.filter(
          (task) => task?.epic?._id === draggedItem.id
        );
        const daysDiff = differenceInDays(
          draggedItem.startDate,
          dragState.originalStartDate!
        );

        for (const task of epicTasks) {
          if (task.startDate && task.dueDate) {
            const newTaskStart = addDays(new Date(task.startDate), daysDiff);
            const newTaskDue = addDays(new Date(task.dueDate), daysDiff);

            await updateTaskDate(task._id ? task._id : "", {
              startDate: format(newTaskStart, "yyyy-MM-dd"),
              dueDate: format(newTaskDue, "yyyy-MM-dd"),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating dates:", error);
    }

    setDragState({
      isDragging: false,
      dragType: null,
      itemId: null,
      startX: 0,
      originalStartDate: null,
      originalEndDate: null,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>
        </div>

        <div className="p-4 flex-1">
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-700">
              Epics ({epics.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {epics.map((epic) => (
                <div
                  key={epic._id}
                  className="p-2 bg-purple-50 rounded text-sm"
                >
                  <div className="font-medium text-purple-800 truncate">
                    {epic.name}
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
              className="w-full mt-3"
              size="small"
            >
              Create Epic
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-gray-700">
              Sprints ({milestones.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {milestones.map((milestone) => {
                const startDate = milestone.startDate
                  ? new Date(milestone.startDate)
                  : new Date();
                const endDate = milestone.dueDate
                  ? new Date(milestone.dueDate)
                  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={milestone._id}
                    className="p-2 bg-blue-50 rounded text-sm"
                  >
                    <div className="font-medium text-blue-800 truncate">
                      {milestone.name}
                    </div>
                    <div className="text-blue-600 text-xs mt-1">
                      {format(startDate, "MMM dd")} -{" "}
                      {format(endDate, "MMM dd")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create Epic Modal */}
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => form.submit()}
          title="Create New Epic"
          okText="Create"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical" onFinish={handleCreateEpic}>
            <Form.Item
              name="name"
              label="Epic Name"
              rules={[{ required: true, message: "Please enter epic name" }]}
            >
              <Input placeholder="Enter epic name" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Enter epic description" />
            </Form.Item>
            <Form.Item name="milestonesId" label="Sprint">
              <Select allowClear placeholder="Select sprint (optional)">
                {milestones.map((m) => (
                  <Option key={m._id} value={m._id}>
                    {m.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker showTime />
            </Form.Item>
            <Form.Item
              label="End date"
              name="endDate"
              rules={[{ required: true, message: "End date is required" }]}
            >
              <DatePicker
                showTime
                disabledDate={(current) => {
                  const startDate = form.getFieldValue("startDate");
                  return startDate && current.isBefore(startDate, "day");
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>

      {/* Timeline View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Timeline Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-800">
                Project Timeline
              </h1>
              <div className="text-sm text-gray-500">
                {format(viewRange.start, "MMM yyyy")} -{" "}
                {format(viewRange.end, "MMM yyyy")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleViewModeChange("today")}
                type={viewMode === "today" ? "primary" : "default"}
                size="small"
              >
                Today
              </Button>
              <Button
                onClick={() => handleViewModeChange("week")}
                type={viewMode === "week" ? "primary" : "default"}
                size="small"
              >
                Week
              </Button>
              <Button
                onClick={() => handleViewModeChange("month")}
                type={viewMode === "month" ? "primary" : "default"}
                size="small"
              >
                Month
              </Button>
              <Button
                onClick={() => handleViewModeChange("quarters")}
                type={viewMode === "quarters" ? "primary" : "default"}
                size="small"
              >
                Quarters
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div
          className="flex-1 overflow-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="min-w-[2000px]">
            {/* Timeline Header with Months */}
            <div className="bg-white border-b sticky top-0 z-10">
              <div className="flex h-12 border-b">
                <div className="w-48 flex-shrink-0 border-r bg-gray-50 flex items-center px-4">
                  <span className="text-sm font-medium text-gray-600">
                    Items
                  </span>
                </div>
                <div className="flex-1 relative">
                  {timelineDays
                    .filter((_, index) => index % 7 === 0)
                    .map((day, index) => {
                      const isTodayDate = showToday && isToday(day);
                      return (
                        <div
                          key={day.toISOString()}
                          className={`absolute border-r border-gray-200 h-full flex items-center justify-center ${
                            isTodayDate ? "bg-blue-100" : ""
                          }`}
                          style={{
                            left: `${((index * 7) / totalDays) * 100}%`,
                            width: `${(7 / totalDays) * 100}%`,
                          }}
                        >
                          <span
                            className={`text-xs ${
                              isTodayDate
                                ? "text-blue-700 font-semibold"
                                : "text-gray-600"
                            }`}
                          >
                            {format(day, "MMM dd")}
                            {isTodayDate && " (Today)"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Timeline Items */}
            <div className="bg-white">
              {timelineItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No timeline items to display
                </div>
              ) : (
                timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex border-b border-gray-100 hover:bg-gray-50"
                  >
                    {/* Item Label */}
                    <div className="w-48 flex-shrink-0 border-r p-3 flex items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {item.type}{" "}
                            {item.status &&
                              `• ${item.status
                                .toLowerCase()
                                .replace("_", " ")}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="flex-1 relative p-3">
                      {/* Background grid lines */}
                      <div className="absolute inset-0">
                        {timelineDays
                          .filter((_, index) => index % 7 === 0)
                          .map((day, index) => (
                            <div
                              key={`grid-${day.toISOString()}`}
                              className="absolute border-r border-gray-100 h-full"
                              style={{
                                left: `${((index * 7) / totalDays) * 100}%`,
                              }}
                            />
                          ))}
                      </div>
                      <div className="relative h-6">
                        <Tooltip
                          title={`${item.name}: ${format(
                            item.startDate,
                            "MMM dd, yyyy"
                          )} - ${format(item.endDate, "MMM dd, yyyy")}`}
                        >
                          <div
                            className={`absolute h-6 rounded flex items-center text-white text-xs font-medium transition-opacity group ${
                              dragState.isDragging &&
                              dragState.itemId === item.id
                                ? "opacity-70 cursor-grabbing"
                                : "cursor-grab hover:opacity-80"
                            }`}
                            style={{
                              backgroundColor: item.color,
                              ...getItemPosition(item),
                            }}
                            onMouseDown={(e) =>
                              handleMouseDown(e, item, "move")
                            }
                          >
                            {/* Left resize handle */}
                            <div
                              className="absolute left-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 rounded-l"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleMouseDown(e, item, "resize-left");
                              }}
                            />

                            {/* Content */}
                            <span className="truncate px-2 flex-1">
                              {item.name}
                            </span>

                            {/* Right resize handle */}
                            <div
                              className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 rounded-r"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleMouseDown(e, item, "resize-right");
                              }}
                            />
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
