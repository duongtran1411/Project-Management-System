"use client";

import { updateTaskDescription } from "@/lib/services/task/task";
import { Task } from "@/types/types";

import { Button, Input } from "antd";
import { useState } from "react";

interface Props {
  task: Task;
  description: string | null;

  setDescription: React.Dispatch<React.SetStateAction<any>>;
  mutateTask: () => void;
}

export const ChangeDescription: React.FC<Props> = ({
  task,
  description,
  setDescription,
  mutateTask,
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const handleSaveDescription = async () => {
    setIsEditingDescription(false);

    try {
      if (!task._id) return;
      if (description) {
        const response = await updateTaskDescription(task._id, description);
        if (response) setDescription(response.description);
        mutateTask();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancelDescription = () => {
    setDescription(task.description || "");
    setIsEditingDescription(false);
  };
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-lg font-semibold">Description</h3>
      {isEditingDescription ? (
        <div>
          <Input.TextArea
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 10 }}
          />
          <div className="flex mt-2 space-x-2">
            <Button type="primary" size="small" onClick={handleSaveDescription}>
              Save
            </Button>
            <Button size="small" onClick={handleCancelDescription}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditingDescription(true)}
          className="cursor-pointer min-h-[50px]"
        >
          {description ? (
            <p className="text-gray-500">{description}</p>
          ) : (
            <p className="text-gray-500">Add a description...</p>
          )}
        </div>
      )}
    </div>
  );
};
