import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { updateTask } from "@/lib/services/task/task";
import { User } from "@/types/types";
import { Avatar, Dropdown, MenuProps } from "antd";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface Props {
  taskId: string | undefined;
  assignee: User;
  mutateTask: () => void;
}

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const ChangeTask: React.FC<Props> = ({ taskId, assignee, mutateTask }) => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: contributorData } = useSWR(
    `${Endpoints.User.GET_BY_PROJECT(projectId)}`,
    fetcher
  );

  const menuItems: MenuProps["items"] = [
    {
      key: "unassigned",
      label: (
        <div className="flex items-center gap-3 p-2">
          <Avatar>U</Avatar>
          <p>Unassignee</p>
        </div>
      ),
    },
    ...(contributorData?.data.map((option: any) => ({
      key: option.userId._id,
      label: (
        <div className="flex items-center gap-3 p-2">
          <Avatar src={option.userId.avatar} />
          <p>{option.userId.fullName}</p>
        </div>
      ),
    })) || []),
  ];

  const handleMenuClick = async ({ key }: { key: string }) => {
    try {
      let data: any;

      if (key === "unassigned") {
        data = {
          assignee: undefined,
        };
      } else {
        const selectedContributor = contributorData?.data.find(
          (contributor: any) => contributor.userId._id === key
        );
        if (!selectedContributor) return;
        data = {
          assignee: key,
        };
      }

      if (taskId) {
        await updateTask(taskId, data);
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
      <div className="flex rounded-full mx-3">
        {assignee?.avatar ? (
          <Avatar src={assignee?.avatar} />
        ) : (
          <Avatar>U</Avatar>
        )}
      </div>
    </Dropdown>
  );
};
export default ChangeTask;
