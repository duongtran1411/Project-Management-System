"use client";
import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  Input,
  Space,
  Spin,
  Tag,
} from "antd";

import CreateSprintModal from "@/components/workspace/backlog/CreateSprintModal";
import { ModalCreateTask } from "@/components/workspace/backlog/ModalCreateTask";
import SprintSection from "@/components/workspace/backlog/SprintSection";
import TaskDetail from "@/components/workspace/backlog/TaskDetail";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { createMilestone } from "@/lib/services/milestone/milestone";
import { Contributor, CreateMilestone, Milestone, Task } from "@/types/types";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

export default function Backlog() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Search states
  const [searchText, setSearchText] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [listTask, setListTask] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetcher = (url: string) =>
    axiosService
      .getAxiosInstance()
      .get(url)
      .then((res) => res.data);

  const { data: epicData, error: epicError } = useSWR(
    `${Endpoints.Epic.GET_BY_PROJECT(projectId)}`,
    fetcher
  );

  const {
    data: taskData,
    error: taskError,
    mutate: mutateTask,
  } = useSWR(`${Endpoints.Task.GET_BY_PROJECT(projectId)}`, fetcher);

  const { data: contributorData, error: contributorError } = useSWR(
    `${Endpoints.User.GET_BY_PROJECT(projectId)}`,
    fetcher
  );

  const {
    data: milestoneData,
    error: milestoneError,
    mutate,
  } = useSWR(`${Endpoints.Milestone.GET_BY_PROJECT(projectId)}`, fetcher);

  // Loading and error states
  const isLoading =
    !epicData || !taskData || !contributorData || !milestoneData;
  const isError = epicError || taskError || contributorError || milestoneError;

  console.log("contributorData", contributorData);
  console.log(" selectedAssignees", selectedAssignees);

  // Filtered tasks based on search criteria
  const filteredTasks = useMemo(() => {
    if (!taskData?.data) return [];

    return taskData.data.filter((task: Task) => {
      // Search by task name
      const nameMatch =
        !searchText ||
        task.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchText.toLowerCase()));

      // Filter by assignee
      const assigneeMatch =
        selectedAssignees.length === 0 ||
        (task._id && selectedAssignees.includes(task._id)) ||
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
        {epicData?.data?.map((epic: any) => (
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
    <div className="max-h-screen p-6 bg-white ">
      <div className="top-0 left-0 right-0 flex items-center gap-3 mb-4">
        {/* Search */}
        <Input
          placeholder="Search tasks..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-[450px] h-[10px] board-search-input"
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
      <div className="flex h-full w-full">
        <div className="overflow-y-auto max-h-[600px] w-full flex-1">
          <SprintSection
            milestoneData={milestoneData?.data}
            listTask={listTask}
            taskData={taskData?.data}
            showModal={showModal}
            refreshData={mutate}
            mutateTask={mutateTask}
            setSelectedTask={setSelectedTask}
            selectedTask={selectedTask}
          />
          {/* Backlog Section */}
          <div className="m-4 bg-gray-100 rounded-sm p-[6px]">
            <div className="flex items-center justify-between rounded-t-md ">
              {/* Left */}
              <div className="flex items-center gap-2">
                <DownOutlined className="text-sm" />

                <h3 className="font-semibold">Backlog </h3>
                <span className="ml-2 text-sm text-gray-500">
                  (0 work items)
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
        </div>
        {selectedTask && (
          <div className="w-[400px] overflow-y-auto max-h-[600px] bg-white shadow-lg p-2  border-l border-gray-200">
            <TaskDetail
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              mutateTask={mutateTask}
            />
          </div>
        )}
      </div>

      {selectedMilestone && (
        <ModalCreateTask
          projectId={projectId}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          //setSelectedMilestone={setSelectedMilestone}
          selectedMilestone={selectedMilestone}
          mutateTask={mutateTask}
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
