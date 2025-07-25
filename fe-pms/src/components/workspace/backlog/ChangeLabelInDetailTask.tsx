import { useRole } from "@/lib/auth/auth-project-context";
import { updateTaskLabels } from "@/lib/services/task/task.service";
import { PlusOutlined, MinusOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Tag } from "antd";
import { useState } from "react";

interface Props {
  taskId: string | undefined;
  labels: string[] | null;
  mutateTask: () => void;
}

const getColor = (s: string) => {
  const normalized = s.toLowerCase();
  if (normalized === "task") return "magenta";
  if (normalized === "bug") return "volcano";
  if (normalized === "story") return "cyan";
  return "default";
};

const ALL_LABELS = ["task", "bug", "story"] as const;

type LabelType = (typeof ALL_LABELS)[number];

const ChangeLabelInDetailTask: React.FC<Props> = ({
  taskId,
  labels: initialLabels = [],
  mutateTask,
}) => {
  const { role } = useRole();
  const isProjectAdmin = role.name === "PROJECT_ADMIN";

  const [labels, setLocalLabels] = useState<string[]>(initialLabels || []);

  const toggleLabel = async (label: LabelType) => {
    const updatedLabels = labels.includes(label)
      ? labels?.filter((l) => l !== label)
      : [...labels, label];

    await updateLabels(updatedLabels);
  };

  const updateLabels = async (updatedLabels: string[]) => {
    try {
      if (taskId) {
        const response = await updateTaskLabels(taskId, updatedLabels);
        if (response) {
          setLocalLabels(response.labels);
          await mutateTask();
        }
      }
    } catch (error) {
      console.error("Error updating labels:", error);
    }
  };

  const renderLabelMenu = () => (
    <div className="bg-white rounded-md shadow-lg p-2">
      {ALL_LABELS.map((label) => {
        const isSelected = labels.includes(label);
        return (
          <div
            key={label}
            className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => isProjectAdmin && toggleLabel(label)}
          >
            {isSelected ? (
              <MinusOutlined className="mr-2 text-red-500" />
            ) : (
              <PlusOutlined className="mr-2 text-green-500" />
            )}
            <Tag color={getColor(label)} className="m-0">
              {label}
            </Tag>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.length === 0 ? (
        <span className="text-gray-400 text-sm">No labels</span>
      ) : (
        labels.map((label, index) => (
          <Tag key={index} color={getColor(label)} className="m-0">
            {label}
          </Tag>
        ))
      )}

      {isProjectAdmin && (
        <Dropdown overlay={renderLabelMenu} trigger={["click"]}>
          <Button
            type="default"
            size="small"
            icon={<DownOutlined />}
            className="flex items-center"
          >
            {labels.length > 0 ? "Edit labels" : "Add label"}
          </Button>
        </Dropdown>
      )}
    </div>
  );
};
export default ChangeLabelInDetailTask;
