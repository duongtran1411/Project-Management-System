"use client";

import { updateTaskDate } from "@/lib/services/task/task.service";

import dayjs from "dayjs";

import { Task } from "@/models/task/task.model";
import { DatePicker } from "antd";

interface Props {
  task: Task;
  dueDate: string | null;
  setDueDate: React.Dispatch<React.SetStateAction<any>>;
  isPickingDueDate: boolean;
  setIsPickingDueDate: React.Dispatch<React.SetStateAction<any>>;
  startDate: string | null;
  mutateTask: () => void;
}

export const ChangeDueDate: React.FC<Props> = ({
  task,
  dueDate,
  setDueDate,
  isPickingDueDate,
  setIsPickingDueDate,
  startDate,
  mutateTask,
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
          className="text-gray-600 hover:bg-gray-200 py-1 rounded-[3px] cursor-pointer"
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
            onChange={(date) => handleDueDateUpdate(date.toISOString())}
            onOpenChange={(open) => {
              if (!open) setIsPickingDueDate(false);
            }}
            disabledDate={(current) => {
              if (!startDate) return false;
              return current && current.isBefore(dayjs(startDate), "day");
            }}
          />
        </div>
      )}
    </div>
  );
};
