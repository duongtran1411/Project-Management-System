"use client";
import {
  Avatar,
  Button,
  Checkbox,
  CheckboxProps,
  Dropdown,
  Input,
  Space,
  Table,
  TableProps,
  Tag,
} from "antd";

import {
  DownOutlined,
  EllipsisOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";

interface DataType {
  key: string;
  name: string;
  epic: string;
  status: string;
  startDate: string;
  assignee: string;
  checked: boolean;
}

const columns: TableProps<DataType>["columns"] = [
  // {
  //   title: "",
  //   dataIndex: "checkbox",
  //   render: (_, record) => <Checkbox checked={record.checked} />,
  //   width: 50,
  // },
  {
    title: "",
    dataIndex: "key",
    render: (key) => (
      <span className="w-[200px] line-through whitespace-nowrap">{key}</span>
    ),
    className: "w-[200px]",
  },
  {
    title: "",
    dataIndex: "name",
    className: "w-full",
  },
  {
    title: "",
    dataIndex: "epic",
    render: (epic) => <Tag color="purple">{epic}</Tag>,
  },
  {
    title: "",
    dataIndex: "status",
    render: (status) => {
      const normalized = status.toLowerCase();
      const color =
        normalized === "done"
          ? "green"
          : normalized === "in progress"
          ? "blue"
          : "gray";

      return <Tag color={color}>{status}</Tag>;
    },
  },

  {
    title: "",
    dataIndex: "startDate",
    render: (status) => <Tag>{status}</Tag>,
  },
  {
    title: "",
    dataIndex: "assignee",
    render: (assignee) => (
      <div className="flex items-center justify-center w-8 h-8 text-white bg-purple-600 rounded-full">
        {assignee}
      </div>
    ),
  },
];

const data: DataType[] = [
  {
    key: "SCRUM-101",
    name: "Implement login API",
    epic: "Authentication",
    status: "TO DO",
    startDate: "2025-06-20",
    assignee: "Alice",
    checked: false,
  },
  {
    key: "SCRUM-102",
    name: "Build user dashboard",
    epic: "User Interface",
    status: "IN PROGRESS",
    startDate: "2025-06-18",
    assignee: "Bob",
    checked: true,
  },
  {
    key: "SCRUM-103",
    name: "Create project API",
    epic: "Project Management",
    status: "DONE",
    startDate: "2025-06-15",
    assignee: "Charlie",
    checked: true,
  },
  {
    key: "SCRUM-104",
    name: "Fix bug in task filter",
    epic: "Task Module",
    status: "TO DO",
    startDate: "2025-06-22",
    assignee: "Diana",
    checked: false,
  },
  {
    key: "SCRUM-105",
    name: "Optimize database queries",
    epic: "Performance",
    status: "IN PROGRESS",
    startDate: "2025-06-19",
    assignee: "Eve",
    checked: false,
  },
];

const overlayContent = (
  <div className="flex flex-col gap-2 p-4 ml-2 bg-white rounded-md shadow-lg">
    <Checkbox value="Option A">Trần Đại Dương</Checkbox>
    <Checkbox value="Option B">Nguyễn Thái Sơn</Checkbox>
    <Checkbox value="Option C">Hoàng Thị Hương Giang</Checkbox>
    <Checkbox value="Option D">Lê Văn Việt</Checkbox>
    <Checkbox value="Option D">Unassigned</Checkbox>
  </div>
);

const overlayEpic = (
  <div className="flex flex-col gap-2 p-4 ml-2 bg-white rounded-md shadow-lg">
    <Checkbox value="Option A">No Epic</Checkbox>
    <Checkbox value="Option B">SRS Document</Checkbox>
    <Checkbox value="Option C">Project Tracking</Checkbox>
    <Checkbox value="Option D">BACKEND API</Checkbox>
  </div>
);

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === "edit") {
    console.log("Edit sprint clicked");
  } else if (key === "delete") {
    console.log("Delete sprint clicked");
  }
};

const items = [
  {
    key: "edit",
    label: "Edit sprint",
  },
  {
    key: "delete",
    label: "Delete sprint",
  },
];
export default function Backlog() {
  const [showTable, setShowTable] = useState<boolean>(true);
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: response } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.GET_BY_PROJECT(
      "64b1e2005a1c000002222201"
    )}`,
    fetcher
  );

  console.log("Epic Data:", response);

  const onChange: CheckboxProps["onChange"] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };
  const handleShowTable = () => {
    setShowTable(!showTable);
  };
  return (
    <div className="min-h-screen p-6 bg-white ">
      <div className="top-0 left-0 right-0 flex items-center gap-3 mb-4">
        {/* Search */}
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="bg-gray-100 w-[184px] h-[32px] border-gray-400"
        />
        {/* Search by member */}
        <Dropdown popupRender={() => overlayContent} trigger={["click"]}>
          <div className="cursor-pointer">
            <Avatar.Group
              size={30}
              max={{
                count: 2,
                style: { color: "#f56a00", backgroundColor: "#fde3cf" },
              }}
            >
              <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
              <Avatar
                style={{
                  backgroundColor: "#f0f1f3",
                  color: "black",
                  fontSize: "12px",
                }}
              >
                +2
              </Avatar>
            </Avatar.Group>
          </div>
        </Dropdown>

        {/* Search by epic */}
        <div className="flex gap-2">
          <Dropdown popupRender={() => overlayEpic} trigger={["click"]}>
            <Button>
              <Space className="font-semibold text-gray-700">
                Epic
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
        <Button type="text" className="font-semibold text-gray-600">
          Clear filters
        </Button>
      </div>

      <div className="m-4 bg-gray-100 rounded-sm p-[6px]">
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-md ">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Checkbox onChange={onChange} />
            {showTable ? (
              <DownOutlined className="text-sm" onClick={handleShowTable} />
            ) : (
              <RightOutlined className="text-sm" onClick={handleShowTable} />
            )}

            <h3 className="font-semibold">SCRUM Sprint 2 </h3>
            <span className="ml-2 text-sm text-gray-500">
              13 Jun – 27 Jun (3 of 30 work items visible)
            </span>
          </div>
          {/* Right */}
          <div className="flex items-center gap-2 ">
            <div className="flex items-center ">
              <Tag color="default" className="w-6 p-0 text-center">
                0
              </Tag>
              <Tag color="blue" className="w-6 p-0 text-center">
                0
              </Tag>
              <Tag color="green" className="w-6 p-0 text-center">
                0
              </Tag>
            </div>
            <Button type="default" className="font-semibold text-gray-600">
              Complete sprint
            </Button>
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button
                icon={<EllipsisOutlined />}
                className="border border-gray-300 shadow-sm"
              />
            </Dropdown>
          </div>
        </div>

        {showTable && (
          <div>
            <Table<DataType>
              columns={columns}
              dataSource={data}
              pagination={false}
              rowKey="key"
              className="border border-t-0 border-gray-200"
              size="small"
            />

            <Button
              type="text"
              className="flex justify-start w-full p-2 my-1 font-semibold text-gray-600"
            >
              <span>
                {" "}
                <PlusOutlined /> Create
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Backlog Section */}
      <div className="m-4 bg-gray-100 rounded-sm p-[6px]">
        <div className="flex items-center justify-between p-2 rounded-t-md ">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Checkbox onChange={onChange} disabled={true} />
            <DownOutlined className="text-sm" />

            <h3 className="font-semibold">Backlog </h3>
            <span className="ml-2 text-sm text-gray-500">(0 work items)</span>
          </div>
          {/* Right */}
          <div className="flex items-center gap-2 ">
            <div className="flex items-center ">
              <Tag color="default" className="w-6 p-0 text-center">
                0
              </Tag>
              <Tag color="blue" className="w-6 p-0 text-center">
                0
              </Tag>
              <Tag color="green" className="w-6 p-0 text-center">
                0
              </Tag>
            </div>
            <Button type="default" className="font-semibold text-gray-600">
              Create sprint
            </Button>
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button
                icon={<EllipsisOutlined />}
                className="border border-gray-300 shadow-sm"
              />
            </Dropdown>
          </div>
        </div>
        <div className="border border-gray-300 p-2 m-2 text-gray-700 border-dashed text-center border-[2px] rounded-sm">
          Your backlog is empty.
        </div>
        <Button
          type="text"
          className="flex justify-start w-full p-2 my-1 font-semibold text-gray-600"
        >
          <span>
            {" "}
            <PlusOutlined /> Create
          </span>
        </Button>
      </div>
    </div>
  );
}
