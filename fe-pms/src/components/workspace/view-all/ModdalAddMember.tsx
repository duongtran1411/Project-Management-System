"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { inviteMemberMultiple } from "@/lib/services/projectContributor/projectContributor.service";
import { isValidEmail } from "@/lib/utils";
import { ProjectRole } from "@/models/projectrole/project.role.model";
import { InviteMultiple } from "@/types/types";
import { MailOutlined } from "@ant-design/icons";
import { Modal, notification, Select, Spin, Tag } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";
const { Option } = Select;

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
  const [projectRoleId, setProjectRoleId] = useState<string | null>(null);
  const [projectRoleError, setProjectRoleError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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

  const { data: projectRoleData } = useSWR(
    `${Endpoints.ProjectRole.GET_ALL}`,
    fetcher
  );

  // Thêm useEffect này vào component
  useEffect(() => {
    if (isInviteModalOpen) {
      setInviteEmails([]);
      setInviteEmailError(null);
      setProjectRoleId(null);
      setProjectRoleError(false);
    }
  }, [isInviteModalOpen]);

  const handleCancelInvite = () => {
    setIsInviteModalOpen(false);
    setInviteEmails([]);
    setInviteEmailError(null);
    setProjectRoleError(false);
    setProjectRoleId(null);
  };

  const handleInvite = async () => {
    if (inviteEmails.length === 0) {
      setInviteEmailError("Please input at least one email");
      return;
    }
    if (!projectRoleId) {
      setProjectRoleError(true);
      return;
    }
    if (inviteProject) {
      const invalids = inviteEmails.filter((email) => !isValidEmail(email));
      if (invalids.length > 0) {
        setInviteEmailError("Invalid email(s): " + invalids.join(", "));
        return;
      }

      setLoading(true);

      try {
        const data: InviteMultiple = {
          emails: inviteEmails,
          projectId: inviteProject._id,
          projectRoleId,
        };
        const response = await inviteMemberMultiple(data);
        console.log("response invite member", response);

        setLoading(false);
        if (response?.success && response?.success?.length > 0) {
          response.success.forEach((item: any) => {
            openNotificationWithIcon(
              "success",
              "Thêm thành viên thành công",
              item.message
            );
          });

          setTimeout(() => {
            setIsInviteModalOpen(false);
            setInviteEmails([]);
            setInviteEmailError(null);
          }, 300);
        }

        if (response?.errors && response?.errors?.length > 0) {
          response.errors.forEach((item: any) => {
            openNotificationWithIcon(
              "error",
              "Thêm thành viên thất bại",
              item.error
            );
          });

          setTimeout(() => {
            setIsInviteModalOpen(false);
            setInviteEmails([]);
            setInviteEmailError(null);
          }, 300);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setProjectRoleError(true);
    }
  };

  return (
    <>
      {contextHolder}
      {loading ? (
        <Spin
          size="large"
          tip="Loading..."
          style={{ color: "#667eea" }}
          fullscreen
        />
      ) : (
        <Modal
          title={`Invite member to${
            inviteProject ? ": " + inviteProject.name : ""
          }`}
          open={isInviteModalOpen}
          onOk={handleInvite}
          onCancel={handleCancelInvite}
          okText="Invite"
          cancelText="Cancel"
          confirmLoading={loading}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Select role"
              value={projectRoleId}
              onChange={(value) => setProjectRoleId(value)}
            >
              {projectRoleData?.data
                .filter((role: ProjectRole) => role.name !== "PROJECT_ADMIN")
                .map((role: ProjectRole) => (
                  <Option key={role._id} value={role._id}>
                    {role.name}
                  </Option>
                ))}
            </Select>
            {projectRoleError && (
              <div style={{ color: "red", marginTop: 8 }}>
                Please select role
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
