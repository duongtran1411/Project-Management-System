"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../../../../styles/globals.css";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTasksByProject } from "@/lib/services/task/task.service";
import { TaskApiResponse } from "@/models/task/task.model";

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

  switch (event.status) {
    case "TO_DO":
      bgClass = "bg-[#F0F1F2] text-blue-800";
      break;
    case "IN_PROGRESS":
      bgClass = "bg-[#E9F2FE] text-yellow-800";
      break;
    case "DONE":
      bgClass = "bg-[#DCFFF1] text-green-800";
      break;
    default:
      bgClass = "bg-gray-200 text-gray-800";
  }

  return (
    <div className={`px-2 py-1 text-xs font-medium truncate ${bgClass}`}>
      {event.title}
    </div>
  );
}

export default function Page() {
  const [calendarEvents, setCalendarEvents] = useState<MyEvent[]>([]);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;

      const data: unknown = await getTasksByProject(projectId);
      if (Array.isArray(data)) {
        const taskList = data as TaskApiResponse[];

        const events: MyEvent[] = taskList.map((task) => {
          const isDone = task.status === "DONE";
          const fallbackDate = new Date();

          let start: Date;
          let end: Date;

          if (isDone) {
            const date = new Date(
              task.dueDate || task.startDate || fallbackDate
            );
            start = date;
            end = date;
          } else {
            start = new Date(task.startDate || task.dueDate || fallbackDate);
            end = new Date(task.dueDate || task.startDate || fallbackDate);
          }

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
      />
    </div>
  );
}
