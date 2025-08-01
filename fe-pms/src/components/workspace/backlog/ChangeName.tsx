"use client";

import { updateTaskName } from "@/lib/services/task/task.service";
import { Task } from "@/models/task/task.model";
import { useState, useEffect } from "react";

import { CloseOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useRole } from "@/lib/auth/auth-project-context";

interface Props {
  task: Task;
  name: string;
  isEditingName: boolean;
  setIsEditingName: React.Dispatch<React.SetStateAction<any>>;
  setName: React.Dispatch<React.SetStateAction<any>>;
  mutateTask: () => void;
  onClose: () => void;
}

export const ChangeName: React.FC<Props> = ({
  task,
  name,
  isEditingName,
  setIsEditingName,
  mutateTask,
  setName,
  onClose,
}) => {
  const { role } = useRole();
  const isProjectAdmin = role.name === "PROJECT_ADMIN";

  const [lastSavedName, setLastSavedName] = useState(name);

  useEffect(() => {
    setLastSavedName(name);
    setName(name);
  }, [task._id]);

  const handleUpdateTaskName = async () => {
    if (!task._id) return;
    try {
      const response = await updateTaskName(task._id, name);
      if (response?.name) {
        setName(response.name);
        setLastSavedName(response.name);
      }
      setIsEditingName(false);
      mutateTask();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="flex items-center justify-between mb-8 text-sm text-gray-800">
      {/* Title */}
      {isEditingName ? (
        <div className="flex flex-col items-center gap-2 mb-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="large"
            className="text-2xl font-semibold"
            onPressEnter={handleUpdateTaskName}
          />
          <div className="flex mt-2 space-x-2">
            <Button type="primary" size="small" onClick={handleUpdateTaskName}>
              Save
            </Button>
            <Button
              size="small"
              onClick={() => {
                setName(lastSavedName || "");
                setIsEditingName(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <h2
          className="mb-2 text-2xl font-semibold cursor-pointer hover:bg-gray-100 px-1 rounded"
          onClick={() => setIsEditingName(isProjectAdmin ? true : false)}
        >
          {name}
        </h2>
      )}
      <CloseOutlined onClick={onClose} />
    </div>
  );
};
