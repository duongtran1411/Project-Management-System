"use client";

import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../../../../styles/globals.css";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTasksByProject } from "@/lib/services/task/task.service";
import { TaskApiResponse } from "@/models/task/task.model";

// Define event types
type RBCEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: unknown;
};

type MyEvent = RBCEvent & {
  sprint?: string;
  status?: string;
};

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CustomEvent({ event }: { event: MyEvent }) {
  let bgClass = "bg-gray-200 text-gray-800";
  let statusIcon = null;
  let badgeColor = "bg-gray-400";
  let statusText = "";

  switch (event.status) {
    case "TO_DO":
      bgClass = "bg-[#F0F1F2] text-blue-800";
      badgeColor = "bg-blue-400";
      statusIcon = (
        <span className="mr-1">📝</span>
      );
      statusText = "To Do";
      break;
    case "IN_PROGRESS":
      bgClass = "bg-[#CFE1FD] text-yellow-800";
      badgeColor = "bg-yellow-400";
      statusIcon = (
        <span className="mr-1">⏳</span>
      );
      statusText = "In Progress";
      break;
    case "DONE":
      bgClass = "bg-[#DCFFF1] text-green-800";
      badgeColor = "bg-green-400";
      statusIcon = (
        <span className="mr-1">✅</span>
      );
      statusText = "Done";
      break;
    default:
      bgClass = "bg-gray-200 text-gray-800";
      badgeColor = "bg-gray-400";
      statusIcon = (
        <span className="mr-1">📋</span>
      );
      statusText = "Unknown";
  }

  // Tooltip content
  const tooltipContent = `${event.title}${event.start && event.end ? `: ${event.start.toLocaleDateString()} - ${event.end.toLocaleDateString()}` : ''}`;

  return (
    <div className={`relative px-2 py-1 text-xs font-medium truncate flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:scale-105 hover:shadow-lg ${bgClass}`}
      style={{ cursor: "pointer" }}
    >
      {/* Tooltip on hover */}
      <div className="absolute z-30 flex-col items-center hidden -translate-x-1/2 pointer-events-none left-1/2 -top-14 group-hover:flex hover:flex">
        <div className="max-w-xs px-4 py-3 text-base font-normal text-white whitespace-pre-line bg-black shadow-2xl rounded-xl" style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)' }}>
          {tooltipContent}
        </div>
        <div className="w-2.5 h-2.5 -mt-1 rotate-45 bg-black" style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}></div>
      </div>
      <div className="flex items-center gap-1 group">
        {statusIcon}
        <span className="truncate max-w-[100px]">{event.title}</span>
        <span className={`ml-2 px-2 py-0.5 rounded-full text-white text-[10px] font-bold ${badgeColor}`}>{statusText}</span>
      </div>
    </div>
  );
}

export default function Page() {
  const [calendarEvents, setCalendarEvents] = useState<MyEvent[]>([]);
  const [view, setView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Thêm state ngày hiện tại

  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;

      const data: unknown = await getTasksByProject(projectId);
      if (Array.isArray(data)) {
        const taskList = data as TaskApiResponse[];

        const events: MyEvent[] = taskList
          .filter((task) => task.startDate || task.dueDate)
          .map((task) => {
            const fallbackDate = new Date();

            const start = task.startDate ? new Date(task.startDate) : new Date(task.dueDate ?? fallbackDate);
            const end = task.dueDate
              ? new Date(task.dueDate)
              : new Date(start.getTime() + 30 * 60 * 1000);

            return {
              title: task.name || "Untitled Task",
              start,
              end,
              sprint: task.epic?.name || "Unknown",
              status: task.status || "TO_DO",
            };
          });


        setCalendarEvents(events);
      }
    };

    fetchTasks();
  }, [projectId]);

  return (
    <div className="h-screen p-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        components={{ event: CustomEvent }}
        defaultDate={new Date()}
        views={["month", "week", "day", "agenda"]}
        view={view}
        date={currentDate} // Thêm prop này
        onView={(newView) => {
          if (["month", "week", "day", "agenda"].includes(newView)) {
            setView(newView as View);
          }
        }}
        onNavigate={(newDate) => setCurrentDate(newDate)} // Thêm prop này
        step={30}
        timeslots={2}
      />
    </div>
  );
}
