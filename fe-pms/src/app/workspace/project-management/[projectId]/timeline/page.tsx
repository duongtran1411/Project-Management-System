"use client";

import { HeaderTimeline } from "@/components/workspace/timeline/HeaderTimeline";
import { ItemsTimeline } from "@/components/workspace/timeline/ItemsTimeline";
import { SidebarTimeline } from "@/components/workspace/timeline/SidebarTimeline";
import { getEpicsByProject } from "@/lib/services/epic/epic.service";
import { getMilestonesByProject } from "@/lib/services/milestone/milestone.service";
import { getTasksByProject } from "@/lib/services/task/task.service";
import { Epic } from "@/models/epic/epic.model";
import { Milestone } from "@/models/milestone/milestone.model";
import { Task } from "@/models/task/task.model";

import { differenceInDays, eachDayOfInterval, format } from "date-fns";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [viewRange, setViewRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  const [showToday, setShowToday] = useState(false);

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
      const endDate = milestone.endDate
        ? new Date(milestone.endDate)
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const timelineDays = eachDayOfInterval(viewRange);

  const totalDays = differenceInDays(viewRange.end, viewRange.start) + 1;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarTimeline
        epics={epics}
        milestones={milestones}
        projectId={projectId}
        setEpics={setEpics}
      />

      {/* Timeline View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Timeline Header */}
        <HeaderTimeline
          viewRange={viewRange}
          setViewRange={setViewRange}
          setShowToday={setShowToday}
        />

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
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
            <ItemsTimeline
              timelineItems={timelineItems}
              viewRange={viewRange}
              timelineDays={timelineDays}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
