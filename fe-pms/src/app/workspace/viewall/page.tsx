// components/ProjectTable.tsx
"use client";

import { Input, Table, Button, Pagination, TableProps } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { useEffect, useState } from "react";
import { Constants } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";

interface Lead {
  name: string;
  avatar: string;
  color: string;
}

interface DataType {
  _id: string;
  name: string;
  icon?: string;
  type: string;
  lead: Lead;
}

const columns: TableProps<DataType>["columns"] = [
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
    render: (text: string) => (
      <div className="flex items-center space-x-2">
        <img src={"/project.png"} alt="logo" className="w-6 h-6 rounded-sm" />
        <span className="font-medium text-gray-600">{text || "updating"}</span>
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
  // {
  //   title: "Lead",
  //   dataIndex: "lead",
  //   key: "lead",
  //   render: (lead) => (
  //     <div className="flex items-center space-x-2">
  //       <Avatar style={{ backgroundColor: lead.color }}>{lead.avatar}</Avatar>
  //       <span>{lead.name}</span>
  //     </div>
  //   ),
  // },
  // {
  //   title: "Project URL",
  //   dataIndex: "url",
  //   key: "url",
  // },
];

const ProjectTable = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<DataType[]>([]);

  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      console.log("decode", decoded);
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
  } = useSWR(
    `${Endpoints.ProjectContributor.GET_PROJECTS_BY_USER(userId || "")}`,
    fetcher
  );

  useEffect(() => {
    if (projectList?.data) {
      const filtered = projectList.data.filter((project: DataType) =>
        project?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
      setCurrentPage(1);
    }
  }, [projectList, searchTerm]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex gap-2">
          <Button type="primary" onClick={handleCreateProject}>
            Create project
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search projects"
          className="w-64"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <Table<DataType>
        columns={columns}
        dataSource={paginatedProjects}
        pagination={false}
        rowKey="_id"
        size="small"
        onRow={(record) => ({
          onClick: () => {
            router.push(`/workspace/project-management/${record._id}`);
          },
          style: { cursor: "pointer" },
        })}
      />

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
