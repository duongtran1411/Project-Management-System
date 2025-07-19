"use client";

import { 
  format, 
  addDays, 
  differenceInDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval 
} from "date-fns";
import { getMilestonesByProject } from "@/lib/services/milestone/milestone.service";
import { getTasksByProject } from "@/lib/services/task/task.service";
import { 
  getEpicsByProject, 
  createEpic 
} from "@/lib/services/epic/epic.service";
import { useParams } from "next/navigation";
import { Milestone } from "@/models/milestone/milestone.model";
import { Epic } from "@/models/epic/epic.model";
import { Task } from "@/models/task/task.model";
import { Button, Form, Input, Select, Modal, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month' | 'quarters'>('month');
  const [showToday, setShowToday] = useState(false);

  // Calculate view range based on view mode
  useEffect(() => {
    let start: Date, end: Date;
    
    switch (viewMode) {
      case 'today':
        start = addDays(currentDate, -1);
        end = addDays(currentDate, 1);
        break;
      case 'week':
        start = addDays(currentDate, -21); // 3 weeks before
        end = addDays(currentDate, 21);   // 3 weeks after
        break;
      case 'month':
        start = startOfMonth(addDays(currentDate, -45));
        end = endOfMonth(addDays(currentDate, 45));
        break;
      case 'quarters':
        start = addDays(currentDate, -180); // 6 months before
        end = addDays(currentDate, 180);    // 6 months after
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

  const navigateMonth = (direction: "prev" | "next") => {
    const days = viewMode === 'today' ? 1 : viewMode === 'week' ? 7 : viewMode === 'quarters' ? 90 : 30;
    setCurrentDate((prev) => addDays(prev, direction === "next" ? days : -days));
  };

  const handleViewModeChange = (mode: 'today' | 'week' | 'month' | 'quarters') => {
    setViewMode(mode);
    if (mode === 'today') {
      setShowToday(true);
      setCurrentDate(new Date()); // Reset to actual today
    } else {
      setShowToday(false);
    }
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>
        </div>
        
        <div className="p-4 flex-1">
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-700">Epics ({epics.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {epics.map((epic) => (
                <div key={epic._id} className="p-2 bg-purple-50 rounded text-sm">
                  <div className="font-medium text-purple-800 truncate">{epic.name}</div>
                  {epic.description && (
                    <div className="text-purple-600 text-xs mt-1 truncate">{epic.description}</div>
                  )}
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
            <h3 className="font-medium mb-3 text-gray-700">Sprints ({milestones.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {milestones.map((milestone) => (
                <div key={milestone._id} className="p-2 bg-blue-50 rounded text-sm">
                  <div className="font-medium text-blue-800 truncate">{milestone.name}</div>
                  <div className="text-blue-600 text-xs mt-1">
                    {format(new Date(milestone.startDate), 'MMM dd')} - {format(new Date(milestone.endDate), 'MMM dd')}
                  </div>
                </div>
              ))}
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
              rules={[{ required: true, message: 'Please enter epic name' }]}
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
          </Form>
        </Modal>
      </div>

      {/* Timeline View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Timeline Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-800">Project Timeline</h1>
              <div className="text-sm text-gray-500">
                {format(viewRange.start, 'MMM yyyy')} - {format(viewRange.end, 'MMM yyyy')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleViewModeChange('today')}
                type={viewMode === 'today' ? 'primary' : 'default'}
                size="small"
              >
                Today
              </Button>
              <Button 
                onClick={() => handleViewModeChange('week')}
                type={viewMode === 'week' ? 'primary' : 'default'}
                size="small"
              >
                Week
              </Button>
              <Button 
                onClick={() => handleViewModeChange('month')}
                type={viewMode === 'month' ? 'primary' : 'default'}
                size="small"
              >
                Month
              </Button>
              <Button 
                onClick={() => handleViewModeChange('quarters')}
                type={viewMode === 'quarters' ? 'primary' : 'default'}
                size="small"
              >
                Quarters
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[1200px]">
            {/* Timeline Header with Months */}
            <div className="bg-white border-b sticky top-0 z-10">
              <div className="flex h-12 border-b">
                <div className="w-48 flex-shrink-0 border-r bg-gray-50 flex items-center px-4">
                  <span className="text-sm font-medium text-gray-600">Items</span>
                </div>
                <div className="flex-1 relative">
                  {timelineDays.filter((_, index) => index % 7 === 0).map((day, index) => (
                    <div 
                      key={day.toISOString()}
                      className="absolute border-r border-gray-200 h-full flex items-center justify-center"
                      style={{ 
                        left: `${(index * 7 / totalDays) * 100}%`,
                        width: `${(7 / totalDays) * 100}%`
                      }}
                    >
                      <span className="text-xs text-gray-600">
                        {format(day, 'MMM dd')}
                      </span>
                    </div>
                  ))}
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
                  <div key={item.id} className="flex border-b border-gray-100 hover:bg-gray-50">
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
                            {item.type} {item.status && `• ${item.status.toLowerCase().replace('_', ' ')}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline Bar */}
                    <div className="flex-1 relative p-3">
                      <div className="relative h-6">
                        <Tooltip 
                          title={`${item.name}: ${format(item.startDate, 'MMM dd, yyyy')} - ${format(item.endDate, 'MMM dd, yyyy')}`}
                        >
                          <div
                            className="absolute h-6 rounded flex items-center px-2 text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: item.color,
                              ...getItemPosition(item)
                            }}
                          >
                            <span className="truncate">{item.name}</span>
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
