"use client";
import {
  deleteMilestone,
  updateMilestone,
  updateStatusMilestone,
} from "@/lib/services/milestone/milestone.service";
import { deleteTaskMultiple } from "@/lib/services/task/task.service";
import { formatDate } from "@/lib/utils";
import {
  DeleteOutlined,
  DownOutlined,
  EllipsisOutlined,
  PlusOutlined,
  RightOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  CheckboxProps,
  Dropdown,
  Modal,
  Table,
  TableProps,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import ChangeAssignee from "./ChangeAssignee";
import ChangeTask from "./ChangeTask";
import EditSprintModal from "./EditSprintModal";
import { Task } from "@/models/task/task.model";
import { Milestone } from "@/models/milestone/milestone.model";
import { useRole } from "@/lib/auth/auth-project-context";
import ChangeEpicInBacklog from "./ChangeEpicInBacklog";
import ChangePriorityInBacklog from "./ChangePriorityInBacklog";

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

interface Props {
  listTask: Task[];
  milestoneData: Milestone[];
  taskData: Task[];
  showModal: (milestone: Milestone) => void;
  refreshData: () => void;
  mutateTask: () => void;
  setSelectedTask: (task: Task | null) => void;
  selectedTask: Task | null;
}

const SprintSection: React.FC<Props> = ({
  listTask,
  milestoneData,
  taskData,
  showModal,
  refreshData,
  mutateTask,
  setSelectedTask,
  selectedTask,
}) => {
  const { role } = useRole();
  const isReadOnlyContributor = role.name === "CONTRIBUTOR";
  const isReadOnlyStakeholder = role.name === "STAKEHOLDER";
  const isProjectAdmin = role.name === "PROJECT_ADMIN";

  const columns: TableProps<Task>["columns"] = [
    {
      title: "",
      dataIndex: "name",
      className: "w-full",
    },
    {
      title: "",
      dataIndex: "epic",
      render: (epic: any, record: Task) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ChangeEpicInBacklog
              taskId={record._id}
              epic={epic?.name}
              mutateTask={mutateTask}
              milestoneId={record.milestones?._id}
            />
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "status",
      render: (status: string, record: Task) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ChangeTask
              taskId={record._id}
              status={status}
              mutateTask={mutateTask}
            />
          </div>
        );
      },
    },

    {
      title: "",
      dataIndex: "dueDate",
      render: (dueDate) => (
        <div className="mx-3">
          <Tag color="default">{dueDate?.slice(0, 10)}</Tag>
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "priority",
      render: (priority: string, record: Task) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ChangePriorityInBacklog
              taskId={record._id}
              priority={priority}
              mutateTask={mutateTask}
            />
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "assignee",
      render: (assignee: any, record: Task) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ChangeAssignee
            taskId={record._id}
            assignee={assignee}
            mutateTask={mutateTask}
          />
        </div>
      ),
    },
  ];
  const [expandedMilestones, setExpandedMilestones] = useState<
    Record<string, boolean>
  >({});

  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (milestoneData) {
      const initial: { [key: string]: boolean } = {};
      milestoneData.forEach((m: Milestone) => {
        initial[m._id] = true;
      });
      setExpandedMilestones(initial);
    }
  }, [milestoneData]);

  //   Edit sprint
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null
  );

  //   Delete sprint
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOk = async () => {
    if (!editingMilestone?._id) return;

    try {
      await deleteMilestone(editingMilestone._id);
      refreshData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete milestone", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleMenuClick = (key: string, milestone: Milestone) => {
    if (key === "edit") {
      setEditingMilestone(milestone);
      setEditModalOpen(true);
    } else if (key === "delete") {
      setEditingMilestone(milestone);
      setIsModalOpen(true);
    }
  };

  const handleUpdate = async (milestone: Milestone) => {
    try {
      await updateMilestone(milestone);
      refreshData();
      setEditModalOpen(false);
      setEditingMilestone(null);
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  };

  const handleSprintStatusChange = async (milestone: Milestone) => {
    try {
      if (milestone.status === "NOT_START") {
        await updateStatusMilestone(milestone._id, "ACTIVE");
      } else if (milestone.status === "ACTIVE") {
        await updateStatusMilestone(milestone._id, "COMPLETED");
      }
      refreshData();
    } catch (error) {
      console.error("Error updating sprint status:", error);
    }
  };

  //Select all checkbox
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const rowSelection = {
    selectedRowKeys: selectedTaskIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedTaskIds(selectedRowKeys as string[]);
    },
  };
  const handleDeleteTask = async () => {
    try {
      if (selectedTaskIds) await deleteTaskMultiple(selectedTaskIds);
      setSelectedTaskIds([]);
      await mutateTask();
      setIsDeleteTaskModalOpen(false); // Đóng modal sau khi xóa
    } catch (error) {
      console.log(error);
    }
  };

  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);

  return (
    <div>
      {milestoneData
        ?.filter((milestone: Milestone) => milestone.status !== "COMPLETED")
        ?.map((milestone: Milestone) => {
          const taskInMileStone = listTask?.filter(
            (task: Task) => task.milestones?._id === milestone._id
          );

          // allTaskIdsInMilestone là mảng chứa tất cả _id của task đang hiển thị
          const allTaskIdsInMilestone = taskInMileStone
            ?.map((task) => task._id)
            ?.filter((id): id is string => typeof id === "string");

          const onChange: CheckboxProps["onChange"] = (e) => {
            if (e.target.checked) {
              setSelectedTaskIds(allTaskIdsInMilestone);
            } else {
              // Nếu đã chọn rồi => bỏ chọn hết
              setSelectedTaskIds([]);
            }
          };

          return (
            <div
              key={milestone._id}
              className="m-4 bg-gray-100 rounded-sm p-[15px]"
            >
              <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-md ">
                {/* Left */}
                <div className="flex items-center gap-2">
                  {isProjectAdmin && <Checkbox onChange={onChange}></Checkbox>}

                  {expandedMilestones[milestone._id] ? (
                    <DownOutlined
                      className="text-sm"
                      onClick={() => toggleMilestone(milestone._id)}
                    />
                  ) : (
                    <RightOutlined
                      className="text-sm"
                      onClick={() => toggleMilestone(milestone._id)}
                    />
                  )}
                  <h3 className="font-semibold">{milestone.name} </h3>
                  <span className="ml-2 text-sm text-gray-500">
                    {milestone.startDate && formatDate(milestone.startDate)} –{" "}
                    {milestone.endDate && formatDate(milestone.endDate)} (
                    {taskInMileStone.length} of {taskData?.length || 0} work
                    items visible)
                  </span>
                </div>
                {/* Right */}
                <div className="flex items-center gap-2 ">
                  <div className="flex items-center ">
                    <Tag color="default" className="w-6 p-0 text-center">
                      {
                        taskInMileStone?.filter(
                          (task: Task) => task.status === "TO_DO"
                        ).length
                      }
                    </Tag>
                    <Tag color="blue" className="w-6 p-0 text-center">
                      {
                        taskInMileStone?.filter(
                          (task: Task) => task.status === "IN_PROGRESS"
                        ).length
                      }
                    </Tag>
                    <Tag color="green" className="w-6 p-0 text-center">
                      {
                        taskInMileStone?.filter(
                          (task: Task) => task.status === "DONE"
                        ).length
                      }
                    </Tag>
                  </div>

                  {/* Complete sprint */}
                  <Button
                    type="default"
                    className="font-semibold text-gray-600"
                    disabled={
                      taskInMileStone.length === 0 ||
                      isReadOnlyContributor ||
                      isReadOnlyStakeholder
                    }
                    onClick={() => handleSprintStatusChange(milestone)}
                  >
                    {milestone.status === "NOT_START"
                      ? "Start sprint"
                      : milestone.status === "ACTIVE"
                      ? "Complete sprint"
                      : null}
                  </Button>

                  {/* More */}
                  <Dropdown
                    menu={{
                      items: items.map((item) => ({
                        ...item,
                        onClick: () => handleMenuClick(item.key, milestone),
                      })),
                    }}
                    placement="bottomRight"
                    trigger={["click"]}
                    disabled={isReadOnlyContributor || isReadOnlyStakeholder}
                  >
                    <Button
                      icon={<EllipsisOutlined />}
                      className="border border-gray-300 shadow-sm"
                    />
                  </Dropdown>
                </div>
              </div>

              {expandedMilestones[milestone._id] && (
                <>
                  {taskInMileStone.length > 0 ? (
                    <Table<Task>
                      rowSelection={rowSelection}
                      columns={columns}
                      dataSource={taskInMileStone}
                      pagination={false}
                      className="border border-t-0 border-gray-200"
                      size="small"
                      showHeader={false}
                      rowKey="_id"
                      onRow={(record) => ({
                        onClick: () => setSelectedTask(record),
                      })}
                      rowClassName={(record) =>
                        selectedTask?._id === record._id ? "bg-blue-100" : ""
                      }
                    />
                  ) : (
                    <div className="border-gray-300 p-2 m-2 text-gray-700 border-dashed text-center border-[2px] rounded-sm">
                      Your backlog is empty.
                    </div>
                  )}

                  <Button
                    type="text"
                    className="flex justify-start w-full p-2 my-1 font-semibold text-gray-600"
                    onClick={() => showModal(milestone)}
                    disabled={isReadOnlyStakeholder || isReadOnlyContributor}
                  >
                    <span>
                      <PlusOutlined /> Create
                    </span>
                  </Button>
                </>
              )}
            </div>
          );
        })}

      {/* Edit sprint */}
      <EditSprintModal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        milestone={editingMilestone}
        onUpdate={handleUpdate}
      />

      {/* Confirm delete sprint */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <WarningOutlined
              style={{
                color: "#ff4d4f",
              }}
            />
            Delete Sprint
          </span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          danger: true,
        }}
      >
        <p>
          Are you sure you want to delete sprint{" "}
          <strong>{editingMilestone?.name}</strong> ?{" "}
        </p>
      </Modal>

      {/* show when checkbox is checked */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-gray-700 border shadow-md rounded-md p-3 flex items-center justify-between z-50 w-max m-auto text-white">
          <div
            className="flex gap-3 hover:bg-gray-900 p-1 rounded-md cursor-pointer"
            onClick={() => setIsDeleteTaskModalOpen(true)}
          >
            <DeleteOutlined />
            <p>Delete task</p>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa task */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <WarningOutlined
              style={{
                color: "#ff4d4f",
              }}
            />
            Delete task
          </span>
        }
        open={isDeleteTaskModalOpen}
        onOk={handleDeleteTask}
        onCancel={() => setIsDeleteTaskModalOpen(false)}
        okButtonProps={{
          danger: true,
        }}
      >
        <p>Are you sure you want to delete {selectedTaskIds.length} task(s)?</p>
      </Modal>
    </div>
  );
};

export default SprintSection;
