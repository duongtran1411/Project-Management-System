"use client";

import { useState } from "react";
import { Button, Input, Select } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Task } from "@/models/task/task.model";
import {
  updateDescriptionTask,
  updatePriorityTask,
  updateTaskName,
} from "@/lib/services/task/task.service";
import { showErrorToast } from "@/components/common/toast/toast";

interface TaskHeaderProps {
  task: Task;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [name, setName] = useState(task.name || "");
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "Medium");

  const priorityOptions = [
    {
      key: "High",
      value: "HIGH",
      icon: <ArrowUpOutlined className="text-red-500" />,
    },
    {
      key: "Medium",
      value: "MEDIUM",
      icon: <FlagOutlined className="text-yellow-500" />,
    },
    {
      key: "Low",
      value: "LOW",
      icon: <ArrowDownOutlined className="text-blue-500" />,
    },
  ];

  const handleSaveName = async () => {
    setIsEditingName(false);
    if (task._id) {
      try {
        await updateTaskName(task._id, name);
      } catch (error: any) {
        showErrorToast(error?.message || "Không thể cập nhật tên task");
      }
    }
  };

  const handleCancelName = () => {
    setName(task.name || "");
    setIsEditingName(false);
  };

  const handleSaveDescription = async () => {
    setIsEditingDescription(false);
    if (task._id) {
      try {
        await updateDescriptionTask(task._id, description);
      } catch (error: any) {
        showErrorToast(error?.message || "Không thể cập nhật mô tả task");
      }
    }
  };

  const handleCancelDescription = () => {
    setDescription(task.description || "");
    setIsEditingDescription(false);
  };

  const handlePriorityChange = async (value: string) => {
    try {
      await updatePriorityTask(task._id || "", value);
      setPriority(value);
    } catch (error: any) {
      showErrorToast(error?.message || "Không thể cập nhật priority");
    }
  };

  return (
    <div className="mb-6">
      {/* Title */}
      {isEditingName ? (
        <div>
          <Input.TextArea
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 10 }}
          />
          <div className="flex mt-2 space-x-2">
            <Button type="primary" size="small" onClick={handleSaveName}>
              Save
            </Button>
            <Button size="small" onClick={handleCancelName}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditingName(true)}
          className="cursor-pointer min-h-[50px]"
        >
          {name ? (
            <h2 className="font-extrabold text-4xl">{name}</h2>
          ) : (
            <p className="text-gray-500">Add a name...</p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <h3 className="mb-2 text-xl font-semibold">Description</h3>
        {isEditingDescription ? (
          <div>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoSize={{ minRows: 3, maxRows: 10 }}
            />
            <div className="flex mt-2 space-x-2">
              <Button
                type="primary"
                size="small"
                onClick={handleSaveDescription}
              >
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

      {/* Priority */}
      <div className="mb-4 flex justify-between items-center">
        <span className="mr-2 text-sm text-gray-500">Priority:</span>
        <Select
          value={priority}
          variant="borderless"
          style={{ width: 160 }}
          options={priorityOptions.map((opt) => ({
            label: (
              <div className="flex gap-2">
                {opt.icon}
                <span>{opt.key}</span>
              </div>
            ),
            value: opt.value,
          }))}
          onChange={handlePriorityChange}
        />
      </div>
    </div>
  );
};
