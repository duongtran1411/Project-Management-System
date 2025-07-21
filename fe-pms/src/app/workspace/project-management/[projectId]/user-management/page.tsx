"use client";

import { ModalAddMember } from "@/components/workspace/view-all/ModdalAddMember";
import { getContributorsByProjectId } from "@/lib/services/projectContributor/projectContributor.service";
import {
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  Input,
  Modal,
  notification,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import useSWR from "swr";

const { Title, Text } = Typography;
const { Option } = Select;

interface ProjectContributor {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  projectRole: {
    _id: string;
    name: string;
    description?: string;
  };
  joinedAt: string;
  status: "active" | "inactive" | "pending";
}

interface ProjectData {
  _id: string;
  name: string;
  description?: string;
}

const UserManagementPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProjectContributor | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch contributors data
  const {
    data: contributors,
    error,
    mutate,
  } = useSWR(
    projectId ? `contributors-${projectId}` : null,
    () => getContributorsByProjectId(projectId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Mock project data - replace with actual API call
  const projectData: ProjectData = {
    _id: projectId,
    name: "Sample Project",
    description: "Project description here",
  };

  const [api, contextHolder] = notification.useNotification();

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    description: string
  ) => {
    api[type]({
      message: title,
      description: description,
      placement: "topRight",
    });
  };

  // Filter contributors based on search and filters
  const filteredContributors =
    contributors?.filter((contributor: ProjectContributor) => {
      const matchesSearch =
        contributor?.user?.fullName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        contributor?.user?.email
          .toLowerCase()
          .includes(searchText.toLowerCase());
      const matchesRole =
        roleFilter === "all" || contributor.projectRole.name === roleFilter;
      const matchesStatus =
        statusFilter === "all" || contributor.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    }) || [];

  // Get unique roles for filter
  const uniqueRoles = [
    ...new Set(contributors?.map((c: any) => c.projectRoleId.name) || []),
  ];

  const handleRemoveUser = async (userId: string) => {
    Modal.confirm({
      title: "Remove User",
      content: "Are you sure you want to remove this user from the project?",
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setLoading(true);
        try {
          // Add remove user API call here
          showNotification(
            "success",
            "User Removed",
            "User has been successfully removed from the project."
          );
          mutate(); // Refresh data
        } catch (error) {
          console.error("Error removing user:", error);
          showNotification(
            "error",
            "Error",
            "Failed to remove user from project."
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleChangeRole = async (userId: string, newRoleId: string) => {
    setLoading(true);
    try {
      // Add change role API call here
      showNotification(
        "success",
        "Role Updated",
        "User role has been successfully updated."
      );
      mutate(); // Refresh data
    } catch (error) {
      showNotification("error", "Error", "Failed to update user role.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toUpperCase()) {
      case "PROJECT_ADMIN":
        return <CrownOutlined style={{ color: "#f39c12" }} />;
      case "CONTRIBUTOR":
        return <UserOutlined style={{ color: "#3498db" }} />;
      default:
        return <UserOutlined />;
    }
  };

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user: ProjectContributor["user"]) => (
        <div className="flex items-center space-x-3">
          <Avatar
            size={40}
            src={user.avatar}
            icon={<UserOutlined />}
            className="border-2 border-gray-200"
          />
          <div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "projectRole",
      key: "role",
      render: (role: ProjectContributor["projectRole"]) => (
        <div className="flex items-center space-x-2">
          {getRoleIcon(role.name)}
          <Tag
            color={role.name === "PROJECT_ADMIN" ? "gold" : "blue"}
            className="px-3 py-1 rounded-full"
          >
            {role.name.replace("_", " ")}
          </Tag>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={
            status === "active"
              ? "success"
              : status === "pending"
              ? "processing"
              : "error"
          }
          text={<span className="capitalize font-medium">{status}</span>}
        />
      ),
    },
    {
      title: "Joined Date",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (date: string) => (
        <Text className="text-gray-600">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: ProjectContributor) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit Role",
                icon: <EditOutlined />,
                onClick: () => {
                  setSelectedUser(record);
                  setIsEditModalOpen(true);
                },
              },
              {
                key: "remove",
                label: "Remove User",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleRemoveUser(record.user._id),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="hover:bg-gray-100"
          />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <Title level={4} type="danger">
            Error Loading Users
          </Title>
          <Text>Failed to load project contributors. Please try again.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {contextHolder}
      {loading && (
        <Spin
          size="large"
          tip="Processing..."
          className="fixed inset-0 z-50 bg-white bg-opacity-75"
        />
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <TeamOutlined className="text-2xl text-white" />
                </div>
                <div>
                  <Title
                    level={2}
                    className="mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    User Management
                  </Title>
                  <Text className="text-gray-600 text-lg">
                    Manage team members and their roles for {projectData.name}
                  </Text>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 h-12"
              >
                Invite Members
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {contributors?.length || 0}
            </div>
            <Text className="text-gray-600">Total Members</Text>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {contributors?.filter(
                (c: ProjectContributor) => c.status === "active"
              ).length || 0}
            </div>
            <Text className="text-gray-600">Active Members</Text>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md rounded-xl">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {contributors?.filter(
                (c: ProjectContributor) => c.status === "pending"
              ).length || 0}
            </div>
            <Text className="text-gray-600">Pending Invites</Text>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {contributors?.filter(
                (c: any) => c.projectRoleId.name === "PROJECT_ADMIN"
              ).length || 0}
            </div>
            <Text className="text-gray-600">Admins</Text>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-lg rounded-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <Input
                placeholder="Search by name or email..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="md:w-80 rounded-lg"
                size="large"
              />
              <Select
                placeholder="Filter by role"
                value={roleFilter}
                onChange={setRoleFilter}
                className="md:w-48"
                size="large"
              >
                <Option value="all">All Roles</Option>
                {uniqueRoles.map((role) => (
                  <Option key={role} value={role}>
                    {role.replace("_", " ")}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                className="md:w-48"
                size="large"
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="pending">Pending</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredContributors.length} of{" "}
              {contributors?.length || 0} members
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredContributors}
            rowKey={(record) => record._id}
            loading={!contributors && !error}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              className: "px-6 py-4",
            }}
            className="custom-table"
            scroll={{ x: 800 }}
          />
        </Card>
      </div>

      {/* Invite Modal */}
      <ModalAddMember
        inviteProject={projectData}
        isInviteModalOpen={isInviteModalOpen}
        setIsInviteModalOpen={setIsInviteModalOpen}
      />

      {/* Edit Role Modal */}
      <Modal
        title="Edit User Role"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => {
          // Handle role update
          setIsEditModalOpen(false);
        }}
        okText="Update Role"
        cancelText="Cancel"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar
                size={48}
                src={selectedUser.user.avatar}
                icon={<UserOutlined />}
              />
              <div>
                <div className="font-medium">{selectedUser.user.fullName}</div>
                <div className="text-sm text-gray-500">
                  {selectedUser.user.email}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Select role"
                defaultValue={selectedUser.projectRole._id}
                size="large"
              >
                {uniqueRoles.map((role) => (
                  <Option key={role} value={role}>
                    {role.replace("_", " ")}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          border: none;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc;
        }

        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default UserManagementPage;
