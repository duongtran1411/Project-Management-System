import { useRole } from "@/lib/auth/auth-project-context";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { updateTaskReporter } from "@/lib/services/task/task.service";
import { Avatar, Dropdown, MenuProps } from "antd";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface Props {
  taskId: string | undefined;
  reporter: any;
  mutateTask: () => void;
  setReporter: React.Dispatch<React.SetStateAction<any>>;
}

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const ChangeReporter: React.FC<Props> = ({
  taskId,
  reporter,
  mutateTask,
  setReporter,
}) => {
  const { role } = useRole();
  const isReadOnlyContributor = role.name === "CONTRIBUTOR";
  const isReadOnlyStakeholder = role.name === "STAKEHOLDER";
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
    ...(contributorData?.data?.map((option: any) => ({
      key: option?.userId?._id,
      label: (
        <div className="flex items-center gap-3 p-2">
          <Avatar src={option?.userId?.avatar} />
          <p>{option?.userId?.fullName}</p>
        </div>
      ),
    })) || []),
  ];

  const handleMenuClick = async ({ key }: { key: string }) => {
    try {
      if (taskId) {
        const response = await updateTaskReporter(taskId, key);
        if (response) setReporter(response.reporter);
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
      disabled={isReadOnlyContributor || isReadOnlyStakeholder}
    >
      <div className="flex items-center gap-2 rounded-full cursor-pointer">
        {reporter?.avatar ? (
          <>
            <Avatar src={reporter?.avatar} />
            <span>{reporter?.fullName}</span>
          </>
        ) : (
          <>
            <Avatar>U</Avatar>
            <span>Unassignee</span>
          </>
        )}
      </div>
    </Dropdown>
  );
};
export default ChangeReporter;
