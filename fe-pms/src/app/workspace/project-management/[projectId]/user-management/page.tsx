"use client";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
} from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

import { ModalAddMember } from "@/components/workspace/view-all/ModdalAddMember";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { deleteContributor } from "@/lib/services/projectContributor/projectContributor.service";
import { formatDateTime } from "@/lib/utils";
import ChangeProjectRole from "@/components/workspace/user-management/ChangeProjectRole";
const { Option } = Select;

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const getStatusColor = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "active") return "green";
  if (normalized === "inactive") return "orange";
  if (normalized === "deleted") return "red";
  return "default";
};

const UserManagementPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch contributors
  const { data: contributors, mutate } = useSWR(
    `${Endpoints.ProjectContributor.GET_USER_LIST(projectId)}`,
    fetcher
  );

  //Fetch project role
  const { data: projectRoles } = useSWR(
    `${Endpoints.ProjectRole.GET_ALL}`,
    fetcher
  );

  //Fetch project
  const { data: project } = useSWR(
    `${Endpoints.Project.GET_BY_ID(projectId)}`,
    fetcher
  );

  //Project statistics
  const { data: projectStatistics, error: projectStatisticsError } = useSWR(
    `${Endpoints.ProjectContributor.PROJECT_STATISTICS(projectId)}`,
    fetcher
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setRoleFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchText || roleFilter !== "all";

  // Handle remove user
  const handleRemoveUser = async (contributorId: string) => {
    Modal.confirm({
      title: "Remove User",
      content: "Are you sure you want to remove this user from the project?",
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteContributor(contributorId);

          mutate();
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        setIsInviteModalOpen(false);
        setLoading(false);
      },
    });
  };

  // Filter users based on search and filters
  const filteredUsers =
    contributors?.data?.filter((user: any) => {
      const matchesSearch =
        user?.userId?.fullName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        user?.userId?.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.userId.status.toLowerCase().includes(searchText.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        user?.projectRoleId?.name?.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    }) || [];

  const columns = [
    {
      title: "User",
      dataIndex: "userId",
      key: "user",
      render: (userId: any) => (
        <div className="flex items-center space-x-3">
          <Avatar src={userId.avatar} size="large" />
          <div>
            <div className="font-medium text-gray-900">{userId.fullName}</div>
            <div className="text-xs text-gray-500">{userId.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "projectRoleId",
      key: "projectRoleId",
      render: (projectRoleId: any, record: any) => (
        <>
          {projectRoleId.name === "PROJECT_ADMIN" ? (
            <Tag color="purple">{projectRoleId?.name}</Tag>
          ) : (
            <ChangeProjectRole
              contributorId={record._id}
              projectRole={projectRoleId.name}
              mutateContributor={mutate}
            />
          )}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "userId",
      key: "status",
      render: (userId: any) => (
        <Tag color={getStatusColor(userId.status)}>{userId.status}</Tag>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (joinedAt: any) => (
        <span className="text-gray-500">{formatDateTime(joinedAt)}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",

      render: (_: any, record: any) => (
        <div className="flex  justify-start space-x-2">
          {record.projectRoleId.name !== "PROJECT_ADMIN" && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveUser(record._id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg">
      {loading && <Spin size="large" fullscreen />}
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          User Management
        </h1>

        {/* Card statistic user */}
        {!projectStatisticsError && (
          <Row gutter={[16, 16]} className="mt-4 mb-4">
            <Col xs={24} sm={12} md={8}>
              <div className="p-[2px] rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <Card bordered={false} className="rounded-xl bg-white">
                  <div className="text-sm text-gray-600 font-semibold mb-1">
                    TOTAL USERS
                  </div>
                  <div className="text-2xl font-bold text-blue-950">
                    {projectStatistics?.data?.totalUsers}
                  </div>
                </Card>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="p-[2px] rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <Card bordered={false} className="rounded-xl bg-white">
                  <div className="text-sm text-gray-600 font-semibold mb-1">
                    ACTIVE USERS
                  </div>
                  <div className="text-2xl font-bold text-blue-950">
                    {projectStatistics?.data?.activeUsers}
                  </div>
                </Card>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="p-[2px] rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <Card bordered={false} className="rounded-xl bg-white">
                  <div className="text-sm text-gray-600 font-semibold mb-1">
                    ORGANIZATION ADMINS
                  </div>
                  <div className="text-2xl font-bold text-blue-950">
                    {projectStatistics?.data?.adminCount}
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        )}
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md items-center gap-2">
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-[300px]"
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Clear filter */}
            {hasActiveFilters && (
              <Button
                type="text"
                className="font-semibold text-gray-600"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Role Filter and Invite Button */}
          <div className="flex items-center space-x-2 w-70">
            <Select
              placeholder="Role"
              value={roleFilter === "all" ? undefined : roleFilter}
              onChange={(value) => setRoleFilter(value || "all")}
              style={{ width: "200px" }}
              size="large"
              allowClear
            >
              <Option value="all">All Roles</Option>
              {projectRoles?.data?.map((role: any) => (
                <Option key={role._id} value={role.name}>
                  {role.name}
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Invite
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} users`,
        }}
      />

      {/* Invite Modal */}
      {project?.data && (
        <ModalAddMember
          inviteProject={project?.data}
          isInviteModalOpen={isInviteModalOpen}
          setIsInviteModalOpen={setIsInviteModalOpen}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
