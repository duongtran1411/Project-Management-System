"use client";
import { Milestone, Task } from "@/types/types";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EllipsisOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Checkbox,
  CheckboxProps,
  Dropdown,
  Modal,
  Table,
  TableProps,
  Tag,
} from "antd";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import EditSprintModal from "./EditSprintModal";
import {
  deleteMilestone,
  updateMilestone,
} from "@/lib/services/milestone/milestone";

const columns: TableProps<Task>["columns"] = [
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
    render: (priority) => <Tag color="orange">{priority}</Tag>,
  },
  {
    title: "",
    dataIndex: "assignee",
    render: (assignee) => (
      <div className="flex rounded-full mx-3">
        {assignee?.avatar ? (
          <Avatar src={assignee?.avatar} />
        ) : (
          <Avatar>U</Avatar>
        )}
      </div>
    ),
  },
];

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
}

const SprintSection: React.FC<Props> = ({
  listTask,
  milestoneData,
  taskData,
  showModal,
  refreshData,
}) => {
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
    console.log("key: ", key);
    if (key === "edit") {
      setEditingMilestone(milestone);
      setEditModalOpen(true);
    } else if (key === "delete") {
      setEditingMilestone(milestone);
      setIsModalOpen(true);
    }
  };

  console.log("edit milestone", editingMilestone);

  const handleUpdate = async (milestone: Milestone) => {
    if (!milestone || !milestone._id) {
      console.warn("Invalid milestone data.");
      return;
    }

    try {
      await updateMilestone(milestone);
      refreshData();
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update milestone:", error);
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

  return (
    <>
      {milestoneData?.map((milestone: Milestone) => {
        const taskInMileStone = listTask?.filter(
          (task: Task) => task.milestones?._id === milestone._id
        );
        // allTaskIdsInMilestone là mảng chứa tất cả _id của task đang hiển thị
        const allTaskIdsInMilestone = taskInMileStone
          .map((task) => task._id)
          .filter((id): id is string => typeof id === "string");

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
            className="m-4 bg-gray-100 rounded-sm p-[6px]"
          >
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-md ">
              {/* Left */}
              <div className="flex items-center gap-2">
                <Checkbox onChange={onChange}></Checkbox>
                {/* <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Chọn tất cả task trong milestone
                      setSelectedTaskIds((prev) =>
                        Array.from(
                          new Set([
                            ...prev,
                            ...allTaskIdsInMilestone.filter(
                              (id): id is string => typeof id === "string"
                            ),
                          ])
                        )
                      );
                    } else {
                      // Bỏ chọn tất cả task trong milestone
                      setSelectedTaskIds((prev) =>
                        prev.filter((id) => !allTaskIdsInMilestone.includes(id))
                      );
                    }
                  }}
                /> */}
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
                  {formatDate(milestone.startDate)} –{" "}
                  {formatDate(milestone.endDate)} ({taskInMileStone.length} of{" "}
                  {taskData?.length || 0} work items visible)
                </span>
              </div>
              {/* Right */}
              <div className="flex items-center gap-2 ">
                <div className="flex items-center ">
                  <Tag color="default" className="w-6 p-0 text-center">
                    {
                      taskInMileStone.filter(
                        (task: Task) => task.status === "TO_DO"
                      ).length
                    }
                  </Tag>
                  <Tag color="blue" className="w-6 p-0 text-center">
                    {
                      taskInMileStone.filter(
                        (task: Task) => task.status === "IN_PROGRESS"
                      ).length
                    }
                  </Tag>
                  <Tag color="green" className="w-6 p-0 text-center">
                    {
                      taskInMileStone.filter(
                        (task: Task) => task.status === "DONE"
                      ).length
                    }
                  </Tag>
                </div>
                {/* <Button type="default" className="font-semibold text-gray-600">
                  Complete sprint
                </Button> */}
                <Dropdown
                  menu={{
                    items: items.map((item) => ({
                      ...item,
                      onClick: () => handleMenuClick(item.key, milestone),
                    })),
                  }}
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
                  />
                ) : (
                  <div className="border border-gray-300 p-2 m-2 text-gray-700 border-dashed text-center border-[2px] rounded-sm">
                    Your backlog is empty.
                  </div>
                )}

                <Button
                  type="text"
                  className="flex justify-start w-full p-2 my-1 font-semibold text-gray-600"
                  onClick={() => showModal(milestone)}
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

      <EditSprintModal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        milestone={editingMilestone}
        onUpdate={handleUpdate}
      />

      <Modal
        title="Delete sprint"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>
          Are you sure you want to delete sprint{" "}
          <strong>{editingMilestone?.name}</strong> ?{" "}
        </p>
      </Modal>

      {/* show when checkbop is checked */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-gray-700 border shadow-md rounded-md p-3 flex items-center justify-between z-50 w-max m-auto text-white">
          <div className="flex gap-3">
            <DeleteOutlined />
            <p>Delete task</p>
            <CloseOutlined className="hover:bg-gray-900 p-1 rounded-md" />
          </div>
        </div>
      )}
    </>
  );
};

export default SprintSection;
