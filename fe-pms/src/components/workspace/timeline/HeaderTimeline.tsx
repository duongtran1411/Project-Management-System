"use client";

import { Button } from "antd";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";

interface Props {
  setShowToday: React.Dispatch<React.SetStateAction<any>>;
  viewRange: { start: Date; end: Date };
  setViewRange: React.Dispatch<React.SetStateAction<any>>;
}

export const HeaderTimeline: React.FC<Props> = ({
  setShowToday,
  viewRange,
  setViewRange,
}) => {
  const [currentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<
    "today" | "week" | "month" | "quarters"
  >("month");

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

  const handleViewModeChange = (
    mode: "today" | "week" | "month" | "quarters"
  ) => {
    setViewMode(mode);
    setShowToday(mode === "today");
  };
  return (
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
  );
};
