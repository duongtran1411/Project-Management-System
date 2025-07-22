import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { updateTaskAssignee } from "@/lib/services/task/task.service";
import { Avatar, Dropdown, MenuProps } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRole } from "@/lib/auth/auth-project-context";

interface Props {
  taskId: string | undefined;
  assignee: any;
  mutateTask: () => void;
}

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const ChangeAssignee: React.FC<Props> = ({ taskId, assignee, mutateTask }) => {
  const { role } = useRole();
  const isReadOnlyContributor = role.name === "CONTRIBUTOR";
  const isReadOnlyStakeholder = role.name === "STAKEHOLDER";
  const params = useParams();
  const projectId = params.projectId as string;
  const [members, setMembers] = useState<string[]>([]); //contributors & project_admin

  const { data: contributorsData } = useSWR(
    `${Endpoints.ProjectContributor.GET_USER_BY_PROJECT(projectId)}`,
    fetcher
  );

  useEffect(() => {
    if (contributorsData?.data) {
      const listMember = contributorsData?.data.filter((member: any) => {
        return member.projectRoleId?.name !== "STAKEHOLDER";
      });

      setMembers(listMember);
    }
  }, [contributorsData?.data]);

  const menuItems: MenuProps["items"] = [
    {
      key: "null",
      label: (
        <div className="flex items-center gap-3 p-2">
          <Avatar>U</Avatar>
          <p>Unassignee</p>
        </div>
      ),
    },
    ...(members.map((option: any) => ({
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
        const assigneeId = key === "null" ? null : key;
        await updateTaskAssignee(taskId, assigneeId);
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
      <div className="flex rounded-full mx-3 cursor-pointer">
        {assignee?.avatar ? (
          <Avatar src={assignee?.avatar} />
        ) : (
          <Avatar>U</Avatar>
        )}
      </div>
    </Dropdown>
  );
};
export default ChangeAssignee;
