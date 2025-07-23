import { useRole } from "@/lib/auth/auth-project-context";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { updateTaskEpic } from "@/lib/services/task/task.service";

import { Dropdown, MenuProps, Tag } from "antd";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface Props {
  taskId: string | undefined;
  epic: string | null;
  mutateTask: () => void;
  milestoneId: string | undefined;
}

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const ChangeEpicInBacklog: React.FC<Props> = ({
  taskId,
  epic,
  mutateTask,
  milestoneId,
}) => {
  const params = useParams();
  const { role } = useRole();
  const isReadOnlyContributor = role.name === "CONTRIBUTOR";
  const isReadOnlyStakeholder = role.name === "STAKEHOLDER";
  const projectId = params.projectId as string;
  const { data: epicData } = useSWR(
    `${Endpoints.Epic.GET_BY_PROJECT(projectId)}`,
    fetcher
  );

  console.log("milestoneId", milestoneId);
  console.log(
    "epicData",
    epicData?.data.filter(
      (option: any) => option.milestonesId?._id === milestoneId
    )
  );

  const menuItems: MenuProps["items"] = epicData?.data
    ?.filter((option: any) => option.milestonesId?._id === milestoneId)
    .map((option: any) => ({
      key: option._id,
      label: <Tag color="purple">{option.name}</Tag>,
    }));

  const handleMenuClick = async ({ key }: { key: string }) => {
    try {
      if (taskId) {
        const response = await updateTaskEpic(taskId, key);

        if (response) {
          await mutateTask();
        }
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
    >
      <Tag color="purple" className="cursor-pointer">
        {epic}
      </Tag>
    </Dropdown>
  );
};
export default ChangeEpicInBacklog;
