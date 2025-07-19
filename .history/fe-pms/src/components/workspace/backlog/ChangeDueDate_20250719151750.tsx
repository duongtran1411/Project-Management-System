"use client";

import { updateTaskDate } from "@/lib/services/task/task.service";

import dayjs from "dayjs";

import { DatePicker } from "antd";
import { Task } from "@/models/task/task.model";

interface Props {
  task: Task;
  dueDate: string | null;
  setDueDate: React.Dispatch<React.SetStateAction<any>>;
  isPickingDueDate: boolean;
  setIsPickingDueDate: React.Dispatch<React.SetStateAction<any>>;
  startDate: string | null;
  mutateTask: () => void;
  dateError: string | null;
  setDateError: React.Dispatch<React.SetStateAction<any>>;
}

export const ChangeDueDate: React.FC<Props> = ({
  task,
  dueDate,
  setDueDate,
  isPickingDueDate,
  setIsPickingDueDate,
  startDate,
  mutateTask,
  dateError,
  setDateError,
}) => {
  const handleDueDateUpdate = async (date: string) => {
    try {
      if (!task._id) return;
      const response = await updateTaskDate(task._id, { dueDate: date });
      if (response?.dueDate) {
        setDueDate(response.dueDate);
      }
      mutateTask();
    } catch (error) {
      console.error("Error updating start date:", error);
    }
  };
  return (
    <div className="mb-4">
      {!isPickingDueDate && (
        <span
          className="text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-[3px] cursor-pointer"
          onClick={() => setIsPickingDueDate(true)}
        >
          {dueDate?.slice(0, 10) || "Add due date"}
        </span>
      )}

      {isPickingDueDate && (
        <div className="mt-2">
          <DatePicker
            open
            value={
              dueDate && typeof dueDate === "string"
                ? dayjs(dueDate)
                : undefined
            }
            onChange={(date, dateString) => {
              const pickedDate = Array.isArray(dateString)
                ? dateString[0]
                : dateString;
              if (startDate && dayjs(pickedDate).isBefore(dayjs(startDate))) {
                setDateError("Due date must be after start date");
                setDueDate(task?.dueDate || null);
              } else {
                setDateError(null);
                if (typeof pickedDate === "string") {
                  setDueDate(pickedDate);
                  handleDueDateUpdate(pickedDate);
                }
                setIsPickingDueDate(false);
              }
            }}
            onOpenChange={(open) => {
              if (!open) setIsPickingDueDate(false);
            }}
            disabledDate={(current) => {
              if (!startDate) return false;
              return current && current.isBefore(dayjs(startDate), "day");
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
