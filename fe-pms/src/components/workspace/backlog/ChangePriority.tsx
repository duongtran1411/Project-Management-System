import { updatePriorityTask } from "@/lib/services/task/task.service";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Dropdown, MenuProps, Tag } from "antd";
import { useRole } from "@/lib/auth/auth-project-context";

interface Props {
  taskId: string | undefined;
  priority: string;
  mutateTask: () => void;
}

const priorityOptions = [
  {
    value: "HIGH",
    icon: <ArrowUpOutlined />,
    color: "red",
  },
  {
    value: "MEDIUM",
    icon: <FlagOutlined />,
    color: "yellow",
  },
  {
    value: "LOW",
    icon: <ArrowDownOutlined />,
    color: "blue",
  },
];

const menuItems: MenuProps["items"] = priorityOptions.map((option) => ({
  key: option.value,
  label: (
    <Tag color={option.color} className="flex items-center gap-1">
      {option.icon}
      {option.value}
    </Tag>
  ),
}));

const ChangePriority: React.FC<Props> = ({ taskId, priority, mutateTask }) => {
  const { role } = useRole();
  const isReadOnlyContributor = role.name === "CONTRIBUTOR";
  const isReadOnlyStakeholder = role.name === "STAKEHOLDER";
  const currentOption = priorityOptions.find(
    (option) => option.value.toLowerCase() === priority.toLowerCase()
  );
  const handleMenuClick = async ({ key }: { key: string }) => {
    try {
      if (taskId) {
        await updatePriorityTask(taskId, key);
        mutateTask();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={["click"]}
      disabled={isReadOnlyContributor || isReadOnlyStakeholder}
      className="priority-dropdown"
    >
      <Tag color={currentOption?.color || "orange"} className="cursor-pointer">
        <span className="flex items-center gap-1">
          {currentOption?.icon}
          {priority}
        </span>
      </Tag>
    </Dropdown>
  );
};
export default ChangePriority;
