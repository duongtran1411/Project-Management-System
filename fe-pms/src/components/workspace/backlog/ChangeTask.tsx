import { updateTaskStatus } from "@/lib/services/task/task";

import { Dropdown, MenuProps, Tag } from "antd";

interface Props {
  taskId: string | undefined;
  status: string;
  mutateTask: () => void;
}

const getColor = (s: string) => {
  const normalized = s.toLowerCase();
  if (normalized === "done") return "green";
  if (normalized === "in_progress") return "blue";
  if (normalized === "to_do") return "gray";
  return "default";
};

const statusOptions = ["TO_DO", "IN_PROGRESS", "DONE"];

const menuItems: MenuProps["items"] = statusOptions.map((option) => ({
  key: option,
  label: <Tag color={getColor(option)}>{option.replace("_", " ")}</Tag>,
}));

const ChangeTask: React.FC<Props> = ({ taskId, status, mutateTask }) => {
  const handleMenuClick = async ({ key }: { key: string }) => {
    try {
      if (taskId) {
        await updateTaskStatus(taskId, key);
        await mutateTask();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={["click"]}
    >
      <Tag color={getColor(status)} className="cursor-pointer">
        {status.replace("_", " ")}
      </Tag>
    </Dropdown>
  );
};
export default ChangeTask;
