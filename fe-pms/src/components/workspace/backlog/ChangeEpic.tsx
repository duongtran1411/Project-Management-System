import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { updateTaskEpic } from "@/lib/services/task/task";

import { Dropdown, MenuProps, Tag } from "antd";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface Props {
  taskId: string | undefined;
  epic: string | undefined;
  mutateTask: () => void;
}

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const ChangeEpic: React.FC<Props> = ({ taskId, epic, mutateTask }) => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: epicData } = useSWR(
    `${Endpoints.Epic.GET_BY_PROJECT(projectId)}`,
    fetcher
  );

  const menuItems: MenuProps["items"] = epicData.data.map((option: any) => ({
    key: option._id,
    label: <Tag color="purple">{option.name}</Tag>,
  }));

  const handleMenuClick = async ({ key }: { key: string }) => {
    try {
      if (taskId) {
        await updateTaskEpic(taskId, key);
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
      <Tag color="purple" className="cursor-pointer">
        {epic}
      </Tag>
    </Dropdown>
  );
};
export default ChangeEpic;
