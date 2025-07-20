"use client";

import { Modal, notification } from "antd";
import { Select } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { useEffect, useState } from "react";
import { isValidEmail } from "@/lib/utils";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import { ProjectRole } from "@/models/projectrole/project.role.model";
import axiosService from "@/lib/services/axios.service";
import { InviteMultiple } from "@/types/types";
import { inviteMemberMultiple } from "@/lib/services/projectContributor/projectContributor.service";
import { showWarningToast } from "@/components/common/toast/toast";

interface DataType {
  _id: string;
  name: string;
  icon?: string;
  type: string;
  projectLead: {
    _id: string;
    fullName: string;
    email: string;
    avatar: string;
  };
}

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

interface Props {
  inviteProject: DataType;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: React.Dispatch<React.SetStateAction<any>>;
}

type NotificationType = "success" | "info" | "warning" | "error";
export const ModalAddMember: React.FC<Props> = ({
  inviteProject,
  isInviteModalOpen,
  setIsInviteModalOpen,
}) => {
  // Modal state
  const [api, contextHolder] = notification.useNotification();
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteEmailError, setInviteEmailError] = useState<string | null>(null);
  const [projectRoleId, setProjectRoleId] = useState<string>();

  const openNotificationWithIcon = (
    type: NotificationType,
    title: string,
    description: string
  ) => {
    api[type]({
      message: title,
      description: description,
    });
  };

  const { data: projectRoleData, error: projectRoleError } = useSWR(
    `${Endpoints.ProjectRole.GET_ALL}`,
    fetcher
  );
  useEffect(() => {
    if (projectRoleData && !projectRoleError) {
      const projectContributor = projectRoleData?.data.find(
        (role: ProjectRole) => role.name === "CONTRIBUTOR"
      );
      if (projectContributor) {
        setProjectRoleId(projectContributor._id);
      } else {
        console.error("Project role 'CONTRIBUTOR' not found");
      }
    }
  }, [projectRoleData, projectRoleError]);

  const handleCancelInvite = () => {
    setIsInviteModalOpen(false);
    setInviteEmails([]);
    setInviteEmailError(null);
  };

  const handleInvite = async () => {
    if (!projectRoleId) {
      showWarningToast("ProjectRoleId was not exist!");
      return;
    }
    if (inviteProject) {
      const invalids = inviteEmails.filter((email) => !isValidEmail(email));
      if (invalids.length > 0) {
        setInviteEmailError("Invalid email(s): " + invalids.join(", "));
        return;
      }
      const data: InviteMultiple = {
        emails: inviteEmails,
        projectId: inviteProject._id,
        projectRoleId,
      };
      const response = await inviteMemberMultiple(data);
      if (response?.success && response?.success?.length > 0) {
        response.success.forEach((item: any) => {
          openNotificationWithIcon(
            "success",
            "Thêm thành viên thành công",
            item.message
          );
        });
      }
      if (response?.errors && response?.errors?.length > 0) {
        response.errors.forEach((item: any) => {
          openNotificationWithIcon(
            "error",
            "Thêm thành viên thất bại",
            item.error
          );
        });
      }

      setIsInviteModalOpen(false);
      setInviteEmails([]);
      setInviteEmailError(null);
    }
  };
  return (
    <>
      {contextHolder}
      <Modal
        title={`Invite member to${
          inviteProject ? ": " + inviteProject.name : ""
        }`}
        open={isInviteModalOpen}
        onOk={handleInvite}
        onCancel={handleCancelInvite}
        okText="Invite"
        cancelText="Cancel"
      >
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Enter emails"
          value={inviteEmails}
          onChange={(values) => {
            const newValue = values[values.length - 1];
            if (newValue && !isValidEmail(newValue)) {
              setInviteEmailError(`Invalid email: ${newValue}`);
              setInviteEmails(values.slice(0, -1));
            } else {
              setInviteEmailError(null);
              setInviteEmails(values);
            }
          }}
          open={false}
          tagRender={(props) => {
            const { label, closable, onClose } = props;
            return (
              <Tag
                color="#667eea"
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
                icon={<MailOutlined />}
              >
                {label}
              </Tag>
            );
          }}
        />
        {inviteEmailError && (
          <div style={{ color: "red", marginTop: 8 }}>{inviteEmailError}</div>
        )}
      </Modal>
    </>
  );
};
