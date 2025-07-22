// components/ProjectTable.tsx
"use client";

import {
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  UserAddOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Dropdown,
  Image,
  Input,
  Menu,
  Pagination,
  Spin,
  Table,
  TableProps,
} from "antd";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { ModalDeleteProject } from "@/components/workspace/settings/ModalDeleteProject";
import { ModalAddMember } from "@/components/workspace/view-all/ModdalAddMember";
import { Constants } from "@/lib/constants";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { TokenPayload } from "@/models/user/TokenPayload.model";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

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
  deletedAt?: string;
}

const ProjectTable = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<DataType[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteProject, setInviteProject] = useState<DataType | null>(null);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const onCloseModalDelete = () => {
    setIsModalDeleteOpen(false);
  };

  const getMenu = (record: DataType, router: any) => (
    <Menu
      items={[
        {
          key: "add-people",
          icon: <UserAddOutlined />,
          label: "Add people",
        },
        {
          key: "project-settings",
          icon: <SettingOutlined />,
          label: "Project settings",
        },
        {
          key: "delete-project",
          icon: <DeleteOutlined style={{ color: "red" }} />,
          label: <span style={{ color: "red" }}>Delete project</span>,
        },
      ]}
      style={{ width: 230 }}
      mode="vertical"
      onClick={({ key }) => {
        setInviteProject(record);

        if (key === "add-people") {
          setIsInviteModalOpen(true);
        } else if (key === "project-settings") {
          router.push(`/workspace/settings/${record._id}`);
        } else if (key === "delete-project") {
          setIsModalDeleteOpen(true);
        }
      }}
    />
  );

  // Định nghĩa columns là function nhận router và userId
  const getColumns = (
    router: any,
    userId: string | null
  ): TableProps<DataType>["columns"] => [
    {
      title: "",
      dataIndex: "star",
      key: "star",
      render: () => <StarOutlined />,
      width: 50,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center space-x-2">
          <Image
            src={record.icon || "/project.png"}
            alt="logo"
            className="rounded-sm"
            width={35}
            height={35}
          />
          <span className="font-medium text-gray-600">
            {text || "updating"}
          </span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "projectType",
      key: "projectType",
      render: (text: string) => (
        <span className="text-gray-500">{text || "updating"}</span>
      ),
    },
    {
      title: "Lead",
      dataIndex: "projectLead",
      key: "lead",
      render: (lead) => (
        <div className="flex items-center space-x-2">
          <Avatar src={lead?.avatar} />
          <span>{lead?.fullName}</span>
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: any, record: DataType) =>
        record.projectLead && record.projectLead._id === userId ? (
          <span
            onClick={(e) => e.stopPropagation()}
            className="w-[60px] h-[60px] rounded-full hover:bg-gray-200 cursor-pointer p-3"
          >
            <Dropdown
              overlay={getMenu(record, router)}
              trigger={["click"]}
              placement="bottomRight"
            >
              <MoreOutlined style={{ fontSize: 20, cursor: "pointer" }} />
            </Dropdown>
          </span>
        ) : null,
    },
  ];

  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      setUserId(decoded.userId);
    }
  }, []);
  const fetcher = (url: string) =>
    axiosService
      .getAxiosInstance()
      .get(url)
      .then((res) => res.data);
  const {
    data: projectList,
    error,
    isLoading,
    mutate,
  } = useSWR(
    `${Endpoints.ProjectContributor.GET_PROJECTS_BY_USER(userId || "")}`,
    fetcher
  );

  useEffect(() => {
    if (projectList?.data) {
      const filtered = projectList.data.map((project: DataType) => ({
        ...project,
        lead: project.projectLead, // Đảm bảo có trường lead cho Table
      }));
      setFilteredProjects(filtered);
      setCurrentPage(1);
    }
  }, [projectList, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading...">
          <div className="p-10" />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert message="Error" description={error.message} type="error" />
      </div>
    );
  }

  const handleCreateProject = () => {
    router.push("/create-project");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={() => router.push("/workspace/trash")}
            icon={<DeleteFilled />}
            size="large"
            className="flex items-center"
          >
            Trash
          </Button>
          <Button
            type="primary"
            onClick={handleCreateProject}
            icon={<PlusOutlined />}
            size="large"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search projects..."
          className="w-[350px] h-9"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchTerm}
          onChange={handleSearch}
          allowClear
        />
      </div>

      <Table<DataType>
        columns={getColumns(router, userId)}
        dataSource={paginatedProjects}
        pagination={false}
        rowKey="_id"
        size="middle"
        className="custom-table"
        onRow={(record) => ({
          onClick: () => {
            router.push(`/workspace/project-management/${record._id}`);
          },
          style: { cursor: "pointer" },
          className: "hover:bg-gray-50 transition-colors duration-200",
        })}
      />
      {/* Modal mời thành viên */}
      {inviteProject && (
        <ModalAddMember
          inviteProject={inviteProject}
          isInviteModalOpen={isInviteModalOpen}
          setIsInviteModalOpen={setIsInviteModalOpen}
        />
      )}

      {inviteProject && (
        <ModalDeleteProject
          isOpen={isModalDeleteOpen}
          onClose={onCloseModalDelete}
          projectId={inviteProject._id}
          projectname={inviteProject.name}
          mutate={mutate}
        />
      )}

      <div className="flex justify-center mt-4">
        <Pagination
          current={currentPage}
          total={filteredProjects?.length || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ProjectTable;
