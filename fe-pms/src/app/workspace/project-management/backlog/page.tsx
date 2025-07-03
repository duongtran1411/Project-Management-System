"use client";
import {
  Avatar,
  Button,
  Checkbox,
  CheckboxProps,
  Dropdown,
  Image,
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
import React, { useState, useMemo } from "react";
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

interface Task {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: {
    _id: string;
    name?: string;
    email?: string;
  };
  epic?: {
    _id: string;
    name: string;
  };
  startDate?: string;
  dueDate?: string;
}

interface Epic {
  _id: string;
  name: string;
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
    dataIndex: "name",
    className: "w-full",
  },
  {
    title: "",
    dataIndex: "epic",
    render: (epic) => (epic ? <Tag color="purple">{epic?.name}</Tag> : <></>),
  },
  {
    title: "",
    dataIndex: "status",
    render: (status) => {
      const normalized = status.toLowerCase();
      const color =
        normalized === "done"
          ? "green"
          : normalized === "in_progress"
          ? "blue"
          : "gray";

      return <Tag color={color}>{status}</Tag>;
    },
  },

  {
    title: "",
    dataIndex: "startDate",
    render: (startDate) => <Tag color="orange">{startDate.slice(0, 10)}</Tag>,
  },
  {
    title: "",
    dataIndex: "assignee",
    render: (assignee) => (
      <div className="flex rounded-full">
        {assignee?.avatar ? (
          <Avatar src={assignee?.avatar} />
        ) : (
          <Avatar>U</Avatar>
        )}
      </div>
    ),
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
  const projectId = "64b1e2005a1c000002222201";
  const [showTable, setShowTable] = useState<boolean>(true);

  // Search states
  const [searchText, setSearchText] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: epicData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );

  const { data: taskData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );

  const { data: userData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.User.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );

  console.log("User Data:", userData);

  // Filtered tasks based on search criteria
  const filteredTasks = useMemo(() => {
    if (!taskData?.data) return [];

    return taskData.data.filter((task: Task) => {
      // Search by task name
      const nameMatch =
        !searchText ||
        task.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchText.toLowerCase()));

      // Filter by assignee
      const assigneeMatch =
        selectedAssignees.length === 0 ||
        (task.assignee?._id && selectedAssignees.includes(task.assignee._id)) ||
        (selectedAssignees.includes("unassigned") && !task.assignee);

      // Filter by epic
      const epicMatch =
        selectedEpics.length === 0 ||
        (task.epic?._id && selectedEpics.includes(task.epic._id));

      return nameMatch && assigneeMatch && epicMatch;
    });
  }, [taskData?.data, searchText, selectedAssignees, selectedEpics]);

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setSelectedAssignees([]);
    setSelectedEpics([]);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchText || selectedAssignees.length > 0 || selectedEpics.length > 0;

  const overlayEpic = (
    <div className="flex flex-col gap-2 p-4 ml-2 bg-white rounded-md shadow-lg">
      <Checkbox.Group value={selectedEpics} onChange={setSelectedEpics}>
        {epicData?.data?.map((epic: Epic) => (
          <Checkbox key={epic._id} value={epic._id}>
            {epic.name}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );

  console.log("Epic Data:", taskData);

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
          placeholder="Search tasks..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="bg-gray-100 w-[184px] h-[32px] border-gray-400"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
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
        <Dropdown popupRender={() => overlayEpic} trigger={["click"]}>
          <Button>
            <Space className="font-semibold text-gray-700">
              Epic
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>

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
              13 Jun – 27 Jun ({filteredTasks.length} of{" "}
              {taskData?.data?.length || 0} work items visible)
            </span>
          </div>
          {/* Right */}
          <div className="flex items-center gap-2 ">
            <div className="flex items-center ">
              <Tag color="default" className="w-6 p-0 text-center">
                {
                  filteredTasks.filter((task: Task) => task.status === "TO_DO")
                    .length
                }
              </Tag>
              <Tag color="blue" className="w-6 p-0 text-center">
                {
                  filteredTasks.filter(
                    (task: Task) => task.status === "IN_PROGRESS"
                  ).length
                }
              </Tag>
              <Tag color="green" className="w-6 p-0 text-center">
                {
                  filteredTasks.filter((task: Task) => task.status === "DONE")
                    .length
                }
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
            {filteredTasks && (
              <>
                <Table<DataType>
                  columns={columns}
                  dataSource={filteredTasks}
                  pagination={false}
                  rowKey="_id"
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
              </>
            )}
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
