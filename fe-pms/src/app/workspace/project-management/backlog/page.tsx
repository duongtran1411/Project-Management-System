"use client";
import {
  Avatar,
  Button,
  Checkbox,
  CheckboxProps,
  Dropdown,
  Input,
  Space,
  Tag,
} from "antd";

import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import React, { useState, useMemo, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Endpoints } from "@/lib/endpoints";
import { CreateMilestone, Epic, Milestone, Task } from "@/types/types";
import SprintSection from "@/components/workspace/backlog/SprintSection";
import { ModalCreateTask } from "@/components/workspace/backlog/ModalCreateTask";
import CreateSprintModal from "@/components/workspace/backlog/CreateSprintModal";
import { createMilestone } from "@/lib/services/milestone/milestone";

const overlayContent = (
  <div className="flex flex-col gap-2 p-4 ml-2 bg-white rounded-md shadow-lg">
    <Checkbox value="Option A">Trần Đại Dương</Checkbox>
    <Checkbox value="Option B">Nguyễn Thái Sơn</Checkbox>
    <Checkbox value="Option C">Hoàng Thị Hương Giang</Checkbox>
    <Checkbox value="Option D">Lê Văn Việt</Checkbox>
    <Checkbox value="Option D">Unassigned</Checkbox>
  </div>
);

//   {
//     key: "edit",
//     label: "Edit sprint",
//   },
//   {
//     key: "delete",
//     label: "Delete sprint",
//   },
// ];
export default function Backlog() {
  const projectId = "64b1e2005a1c000002222201";

  // Search states
  const [searchText, setSearchText] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [listTask, setListTask] = useState<Task[]>([]);

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

  const { data: milestoneData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Milestone.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );
  const refreshData = () => {
    mutate(
      `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Milestone.MILESTONE}`
    );
  };

  console.log("milestone list", milestoneData);

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

  useEffect(() => {
    if (filteredTasks) setListTask(filteredTasks);
  }, [filteredTasks]);

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

  //Create new task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const showModal = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  //Create new sprint
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const handleCreateSprint = async (data: CreateMilestone) => {
    await createMilestone(data); // gọi API
    mutate(`${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Milestone}`);
    setOpenCreateModal(false);
  };

  return (
    <div className="min-h-screen p-6 bg-white ">
      <div className="top-0 left-0 right-0 flex items-center gap-3 mb-4">
        {/* Search */}
        <Input
          placeholder="Search tasks..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className=" w-[184px] h-[32px] border-gray-400"
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

      {/* Sprint Section */}
      <SprintSection
        milestoneData={milestoneData?.data}
        listTask={listTask}
        taskData={taskData?.data}
        showModal={showModal}
        refreshData={refreshData}
      />

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
            <Button
              type="default"
              className="font-semibold text-gray-600"
              onClick={() => setOpenCreateModal(true)}
            >
              Create sprint
            </Button>
          </div>
        </div>
        <div className="border border-gray-300 p-2 m-2 text-gray-700 border-dashed text-center border-[2px] rounded-sm">
          Your backlog is empty.
        </div>
        {/* <Button
          type="text"
          className="flex justify-start w-full p-2 my-1 font-semibold text-gray-600"
        >
          <span>
            {" "}
            <PlusOutlined /> Create
          </span>
        </Button> */}
      </div>

      <ModalCreateTask
        projectId={projectId}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setSelectedMilestone={setSelectedMilestone}
        selectedMilestone={selectedMilestone}
      />

      <CreateSprintModal
        open={openCreateModal}
        onCancel={() => setOpenCreateModal(false)}
        onCreate={handleCreateSprint}
        projectId={projectId}
      />
    </div>
  );
}
