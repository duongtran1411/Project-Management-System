import { useRole } from "@/lib/auth/auth-project-context";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { updateProjectRole } from "@/lib/services/projectContributor/projectContributor.service";

import { Dropdown, MenuProps, Tag } from "antd";

import useSWR from "swr";

interface Props {
  contributorId: string;
  projectRole: string;
  mutateContributor: () => void;
}

const getColor = (s: string) => {
  const normalized = s.toLowerCase();
  if (normalized === "project_admin") return "purple";
  if (normalized === "contributor") return "volcano";
  if (normalized === "stakeholder") return "lime";
  return "default";
};

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const ChangeProjectRole: React.FC<Props> = ({
  contributorId,
  projectRole,
  mutateContributor,
}) => {
  const { role } = useRole();
  const isReadOnlyContributor = role.name === "CONTRIBUTOR";
  const isReadOnlyStakeholder = role.name === "STAKEHOLDER";
  const { data: projectRoleData } = useSWR(
    `${Endpoints.ProjectRole.GET_ALL}`,
    fetcher
  );

  const menuItems: MenuProps["items"] = projectRoleData?.data
    ?.filter((option: any) => option.name !== "PROJECT_ADMIN")
    .map((option: any) => ({
      key: option._id,
      label: <Tag color={getColor(option.name)}>{option.name}</Tag>,
    }));

  const handleMenuClick = async ({ key }: { key: string }) => {
    try {
      if (contributorId) {
        await updateProjectRole(contributorId, key);
        await mutateContributor();
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
      <Tag color={getColor(projectRole)} className="cursor-pointer">
        {projectRole}
      </Tag>
    </Dropdown>
  );
};
export default ChangeProjectRole;
