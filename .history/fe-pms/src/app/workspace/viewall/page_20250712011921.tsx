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

interface Lead {
  name: string;
  avatar: string;
  color: string;
}

interface DataType {
  key: string;
  name: string;
  keyCode: string;
  type: string;
  lead: Lead;
  logo: string;
  url?: string; // Optional field for project URL
}

// const data: DataType[] = [
//   {
//     key: "1",
//     name: "dsdfsd",
//     keyCode: "DDDDS",
//     type: "Team-managed software",
//     lead: { name: "Duong Tran", avatar: "DT", color: "blue" },
//     logo: "/logo1.png",
//   },
//   {
//     key: "2",
//     name: "HE172042_TranDaiDuong_Lab1",
//     keyCode: "LAB8",
//     type: "Team-managed software",
//     lead: { name: "Tran Dai Duong", avatar: "TD", color: "purple" },
//     logo: "/logo2.png",
//   },
//   {
//     key: "3",
//     name: "Project Management",
//     keyCode: "SCRUM",
//     type: "Team-managed software",
//     lead: { name: "Tran Dai Duong", avatar: "TD", color: "purple" },
//     logo: "/logo2.png",
//   },
//   {
//     key: "4",
//     name: "tesprojectpublic",
//     keyCode: "TS",
//     type: "Team-managed software",
//     lead: { name: "Tran Dai Duong", avatar: "TD", color: "purple" },
//     logo: "/logo2.png",
//   },
// ];

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      setUserId(decoded.userId);
    }
  }, []);
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const {
    data: projectList,
    error,
    isLoading,
  } = useSWR(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }${Endpoints.ProjectContributor.GET_PROJECTS_BY_USER(userId || "")}`,
    fetcher
  );

  console.log("proejctList", projectList);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreateProject = () => {
    router.push("/create-project");
  };
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
        <Input placeholder="Search projects" className="w-64" />
      </div>

      <Table<DataType>
        columns={columns}
        dataSource={projectList?.data}
        pagination={false}
        rowKey="key"
        size="small"
      />

      <div className="flex justify-center mt-4">
        <Pagination current={1} total={4} pageSize={4} />
      </div>
    </div>
  );
};

export default ProjectTable;
