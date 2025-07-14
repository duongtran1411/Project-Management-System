"use client";
import {
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  Input,
  Space,
  Tag,
  Spin,
  Alert,
} from "antd";

import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import React, { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import {
  Contributor,
  CreateMilestone,
  Epic,
  Milestone,
  Task,
} from "@/types/types";
import SprintSection from "@/components/workspace/backlog/SprintSection";
import { ModalCreateTask } from "@/components/workspace/backlog/ModalCreateTask";
import CreateSprintModal from "@/components/workspace/backlog/CreateSprintModal";
import { createMilestone } from "@/lib/services/milestone/milestone";
import { useParams } from "next/navigation";

export default function Backlog() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Search states
  const [searchText, setSearchText] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [listTask, setListTask] = useState<Task[]>([]);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: epicData, error: epicError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );

  const { data: taskData, error: taskError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );
  console.log("task data", taskData);

  const { data: contributorData, error: contributorError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.User.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );

  const {
    data: milestoneData,
    error: milestoneError,
    mutate,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Milestone.GET_BY_PROJECT(
      projectId
    )}`,
    fetcher
  );
  // const refreshData = () => {
  //   mutate();
  // };

  // Loading and error states
  const isLoading =
    !epicData || !taskData || !contributorData || !milestoneData;
  const isError = epicError || taskError || contributorError || milestoneError;

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

  console.log("list task", listTask);

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setSelectedAssignees([]);
    setSelectedEpics([]);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchText || selectedAssignees.length > 0 || selectedEpics.length > 0;

  //Create new task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading...">
          <div className="p-10" />
        </Spin>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert
          message="Error"
          description="Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const overlayEpic = (
    <div className="p-4 ml-2 bg-white rounded-md shadow-lg">
      <Checkbox.Group
        value={selectedEpics}
        onChange={setSelectedEpics}
        className="flex flex-col gap-2 "
      >
        {epicData?.data?.map((epic: Epic) => (
          <Checkbox key={epic._id} value={epic._id}>
            {epic.name}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
  const overlayContributor = (
    <div className=" p-4 ml-2 bg-white rounded-md shadow-lg">
      <Checkbox.Group
        value={selectedAssignees}
        onChange={setSelectedAssignees}
        className="flex flex-col  gap-2"
      >
        {contributorData?.data?.map((contributor: Contributor) => (
          <Checkbox key={contributor._id} value={contributor._id}>
            {contributor?.userId?.fullName}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );

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
        <Dropdown popupRender={() => overlayContributor} trigger={["click"]}>
          <div className="cursor-pointer">
            <Avatar.Group
              size={30}
              max={{
                count: 2,
                style: { color: "#f56a00", backgroundColor: "#fde3cf" },
              }}
            >
              <Avatar style={{ backgroundColor: "#f56a00" }}>C</Avatar>
              {contributorData?.data?.length > 1 && (
                <Avatar
                  style={{
                    backgroundColor: "#f0f1f3",
                    color: "black",
                    fontSize: "12px",
                  }}
                >
                  +{contributorData.data.length}
                </Avatar>
              )}
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
        refreshData={mutate}
      />

      {/* Backlog Section */}
      <div className="m-4 bg-gray-100 rounded-sm p-[6px]">
        <div className="flex items-center justify-between p-2 rounded-t-md ">
          {/* Left */}
          <div className="flex items-center gap-2">
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
      {selectedMilestone && (
        <ModalCreateTask
          projectId={projectId}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          //setSelectedMilestone={setSelectedMilestone}
          selectedMilestone={selectedMilestone}
        />
      )}

      <CreateSprintModal
        open={openCreateModal}
        onCancel={() => setOpenCreateModal(false)}
        onCreate={handleCreateSprint}
        projectId={projectId}
      />
    </div>
  );
}
