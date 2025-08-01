"use client";

import { useRole } from "@/lib/auth/auth-project-context";
import { updateTaskDescription } from "@/lib/services/task/task.service";
import { Task } from "@/models/task/task.model";

import { Button, Input } from "antd";
import { useState, useEffect } from "react";

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
  const { role } = useRole();
  const isProjectAdmin = role.name === "PROJECT_ADMIN";
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [lastSavedDescription, setLastSavedDescription] = useState(description);

  useEffect(() => {
    setLastSavedDescription(description);
    setDescription(description);
  }, [task._id]);

  const handleSaveDescription = async () => {
    setIsEditingDescription(false);

    try {
      if (!task._id) return;
      if (description) {
        const response = await updateTaskDescription(task._id, description);
        mutateTask();
        if (response) {
          setDescription(response.description);
          setLastSavedDescription(response.description);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancelDescription = () => {
    setDescription(lastSavedDescription || "");
    setIsEditingDescription(false);
  };
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-lg font-semibold text-gray-600">Description</h3>
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
          onClick={() => setIsEditingDescription(isProjectAdmin ? true : false)}
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
