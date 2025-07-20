"use client";

import { Tooltip } from "antd";
import { differenceInDays, format } from "date-fns";

interface TimelineItem {
  id: string;
  name: string;
  type: "sprint" | "epic";
  startDate: Date;
  endDate: Date;
  status?: string;
  color: string;
}

interface Props {
  timelineItems: TimelineItem[];
  viewRange: any;
  timelineDays: Date[];
}

export const ItemsTimeline: React.FC<Props> = ({
  timelineItems,
  viewRange,
  timelineDays,
}) => {
  // Generate timeline grid

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
    <div className="bg-white">
      {timelineItems.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No timeline items to display
        </div>
      ) : (
        timelineItems.map((item: TimelineItem) => (
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
                      `• ${item.status.toLowerCase().replace("_", " ")}`}
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
                    className={`absolute h-6 rounded flex items-center text-white text-xs font-medium transition-opacity group cursor-grab hover:opacity-80`}
                    style={{
                      backgroundColor: item.color,
                      ...getItemPosition(item),
                    }}
                  >
                    {/* Left resize handle */}
                    <div className="absolute left-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 rounded-l" />

                    {/* Content */}
                    <span className="truncate px-2 flex-1">{item.name}</span>

                    {/* Right resize handle */}
                    <div className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 rounded-r" />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
