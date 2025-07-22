"use client";

import { useRole } from "@/lib/auth/auth-project-context";
import { updateTaskDate } from "@/lib/services/task/task.service";

import dayjs from "dayjs";

import { DatePicker } from "antd";
import { Task } from "@/models/task/task.model";

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
}) => {
  const { role } = useRole();
  const isProjectAdmin = role.name === "PROJECT_ADMIN";
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
          className="text-gray-600 hover:bg-gray-200 py-1 rounded-[3px]cursor-pointer"
          onClick={() => setIsPickingStartDate(isProjectAdmin ? true : false)}
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
            onChange={(dateString) =>
              handleStartDateUpdate(dateString.toISOString())
            }
            onOpenChange={(open) => {
              if (!open) setIsPickingStartDate(false);
            }}
            disabledDate={(current) => {
              if (!dueDate) return false;
              return current && current.isAfter(dayjs(dueDate), "day");
            }}
          />
        </div>
      )}
    </div>
  );
};
