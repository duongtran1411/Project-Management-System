// components/ProjectTable.tsx
"use client";

import { Input, Table, Button, Avatar, Pagination, TableProps } from "antd";
import { StarOutlined } from "@ant-design/icons";

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

const data: DataType[] = [
  {
    key: "1",
    name: "dsdfsd",
    keyCode: "DDDDS",
    type: "Team-managed software",
    lead: { name: "Duong Tran", avatar: "DT", color: "blue" },
    logo: "/logo1.png",
  },
  {
    key: "2",
    name: "HE172042_TranDaiDuong_Lab1",
    keyCode: "LAB8",
    type: "Team-managed software",
    lead: { name: "Tran Dai Duong", avatar: "TD", color: "purple" },
    logo: "/logo2.png",
  },
  {
    key: "3",
    name: "Project Management",
    keyCode: "SCRUM",
    type: "Team-managed software",
    lead: { name: "Tran Dai Duong", avatar: "TD", color: "purple" },
    logo: "/logo2.png",
  },
  {
    key: "4",
    name: "tesprojectpublic",
    keyCode: "TS",
    type: "Team-managed software",
    lead: { name: "Tran Dai Duong", avatar: "TD", color: "purple" },
    logo: "/logo2.png",
  },
];

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
    render: (text: string, record: any) => (
      <div className="flex items-center space-x-2">
        <img src={record.logo} alt="logo" className="w-6 h-6 rounded-sm" />
        <span className="text-blue-600 font-medium">{text}</span>
      </div>
    ),
  },
  {
    title: "Key",
    dataIndex: "keyCode",
    key: "keyCode",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Lead",
    dataIndex: "lead",
    key: "lead",
    render: (lead: any) => (
      <div className="flex items-center space-x-2">
        <Avatar style={{ backgroundColor: lead.color }}>{lead.avatar}</Avatar>
        <span>{lead.name}</span>
      </div>
    ),
  },
  {
    title: "Project URL",
    dataIndex: "url",
    key: "url",
  },
];

const ProjectTable = () => {
  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex gap-2">
          <Button type="primary">Create project</Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Input placeholder="Search projects" className="w-64" />
      </div>

      <Table
        columns={columns}
        dataSource={data}
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
