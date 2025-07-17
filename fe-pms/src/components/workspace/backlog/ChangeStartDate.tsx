"use client";

import { updateTaskDate } from "@/lib/services/task/task";
import { Task } from "@/types/types";
import dayjs from "dayjs";

import { DatePicker } from "antd";

interface Props {
  task: Task;
  startDate: string | null;
  setStartDate: React.Dispatch<React.SetStateAction<any>>;
  isPickingStartDate: boolean;
  setIsPickingStartDate: React.Dispatch<React.SetStateAction<any>>;
  dueDate: string | null;
  mutateTask: () => void;
  dateError: string | null;
  setDateError: React.Dispatch<React.SetStateAction<any>>;
}

export const ChangeStartDate: React.FC<Props> = ({
  task,
  startDate,
  setStartDate,
  isPickingStartDate,
  setIsPickingStartDate,
  dueDate,
  mutateTask,
  dateError,
  setDateError,
}) => {
  const handleStartDateUpdate = async (date: string) => {
    try {
      if (!task._id) return;
      const response = await updateTaskDate(task._id, { startDate: date });
      if (response?.startDate) {
        setStartDate(response.startDate);
      }
      mutateTask();
    } catch (error) {
      console.error("Error updating start date:", error);
    }
  };
  return (
    <div className="mb-4">
      {!isPickingStartDate && (
        <span
          className="text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-[3px] cursor-pointer"
          onClick={() => setIsPickingStartDate(true)}
        >
          {startDate?.slice(0, 10) || "Add start date"}
        </span>
      )}

      {isPickingStartDate && (
        <div className="mt-2">
          <DatePicker
            open
            value={
              startDate && typeof startDate === "string"
                ? dayjs(startDate)
                : undefined
            }
            onChange={(date, dateString) => {
              const pickedDate = Array.isArray(dateString)
                ? dateString[0]
                : dateString;

              if (dueDate && dayjs(pickedDate).isAfter(dayjs(dueDate))) {
                setDateError("Start date must be before due date");
                setStartDate(task?.startDate || null); // reset lại nếu sai
              } else {
                setDateError(null);
                if (typeof pickedDate === "string") {
                  setStartDate(pickedDate);
                  handleStartDateUpdate(pickedDate);
                }
                setIsPickingStartDate(false);
              }
            }}
            onOpenChange={(open) => {
              if (!open) setIsPickingStartDate(false);
            }}
          />
          {dateError && (
            <div className="text-red-500 text-xs mt-1">{dateError}</div>
          )}
        </div>
      )}
    </div>
  );
};
