"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import '../../../../styles/globals.css'

type RBCEvent = {
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: unknown;
};

type MyEvent = RBCEvent & {
    sprint?: string;
};

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const events: MyEvent[] = [
    {
        title: "SCRUM Sprint 1",
        start: new Date(2025, 5, 1),
        end: new Date(2025, 5, 6),
        sprint: "Sprint 1",
    },
    {
        title: "SCRUM-22 Design Sequence",
        start: new Date(2025, 5, 4),
        end: new Date(2025, 5, 4),
        sprint: "Sprint 1",
    },
    {
        title: "SCRUM Sprint 2",
        start: new Date(2025, 5, 10),
        end: new Date(2025, 5, 14),
        sprint: "Sprint 2",
    },
    {
        title: "SCRUM-45 Configure Backend",
        start: new Date(2025, 5, 12),
        end: new Date(2025, 5, 12),
        sprint: "Sprint 2",
    },
    {
        title: "SCRUM Sprint 3",
        start: new Date(2025, 5, 17),
        end: new Date(2025, 5, 21),
        sprint: "Sprint 3",
    },
    {
        title: "SCRUM-51 Final UI",
        start: new Date(2025, 5, 19),
        end: new Date(2025, 5, 19),
        sprint: "Sprint 3",
    },
];

function CustomEvent({ event }: { event: MyEvent }) {
    let bgClass = "bg-[#E5E7EB] text-black";

    switch (event.sprint) {
        case "Sprint 1":
            bgClass = "bg-[#DCFFF1] text-blue-800";
            break;
        case "Sprint 2":
            bgClass = "bg-[#E9F2FE] text-green-800";
            break;
        case "Sprint 3":
            bgClass = "bg-yellow-100 text-yellow-800";
            break;
    }

    return (
        <div
            className={`px-2 py-1  text-xs font-medium truncate ${bgClass} `}
        >
            {event.title}
        </div>
    );
}

export default function Page() {
    return (
        <div className="h-screen p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                components={{ event: CustomEvent }}
            />
        </div>
    );
}
