"use client";

import { useRole } from "@/lib/auth/auth-project-context";
import {
  createEpic,
  deleteEpic,
  getEpicsByProject,
  updateEpic,
} from "@/lib/services/epic/epic.service";
import { Epic } from "@/models/epic/epic.model";
import { Milestone } from "@/models/milestone/milestone.model";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Select,
  Tooltip,
} from "antd";
import { format } from "date-fns";
import { useState } from "react";

const { Option } = Select;

interface Props {
  epics: Epic[];
  milestones: Milestone[];
  projectId: string;
  setEpics: React.Dispatch<React.SetStateAction<any>>;
}

export const SidebarTimeline: React.FC<Props> = ({
  epics,
  milestones,
  projectId,
  setEpics,
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const { role } = useRole();
  const isProjectLead = role.name === "PROJECT_ADMIN";

  const handleSubmit = async (values: any) => {
    try {
      if (selectedEpic) {
        await updateEpic(selectedEpic._id, values);
      } else {
        await createEpic({ ...values, projectId });
      }
      // Reset everything after successful operation
      setSelectedEpic(null);
      form.resetFields();
      setOpen(false);
      
      // Refresh epics
      const updatedEpics = await getEpicsByProject(projectId);
      setEpics(updatedEpics);
    } catch (error) {
      console.error('Error saving epic:', error);
    }
  };

  const getMenu = (record: any) => (
    <Menu
      items={[
        {
          key: "edit-epic",
          icon: <EditOutlined />,
          label: "Edit epic",
        },

        {
          key: "delete-epic",
          icon: <DeleteOutlined style={{ color: "red" }} />,
          label: <span style={{ color: "red" }}>Delete epic</span>,
        },
      ]}
      style={{ width: 230 }}
      mode="vertical"
      onClick={({ key }) => {
        setSelectedEpic(record);
        console.log("record", record);

        if (key === "edit-epic") {
          form.setFieldsValue({
            name: record.name,
            description: record.description,
            milestonesId: record.milestonesId?._id,
          });
          setOpen(true);
        } else if (key === "delete-epic") {
          setIsModalDeleteOpen(true);
        }
      }}
    />
  );

  const handleDeleteEpic = async (epic: Epic) => {
    try {
      await deleteEpic(epic._id);
      setIsModalDeleteOpen(false);
      setSelectedEpic(null);
      // Refresh epics
      getEpicsByProject(projectId).then(setEpics);
    } catch (error) {
      console.error("Error deleting epic:", error);
    }
  };

  return (
    <div className="w-64 border-r bg-white h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-6">
          <h3 className="font-medium mb-3 text-gray-700">
            Epics ({epics.length})
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {epics.map((epic) => (
              <div
                key={epic._id}
                className="flex flex-1 items-center justify-between p-2 bg-purple-50 rounded text-sm"
              >
                <div className="font-medium text-purple-800 truncate">
                  {epic.name}
                </div>
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="w-[25px] h-[25px] rounded-full hover:bg-gray-200 cursor-pointer p-1 flex items-center justify-center "
                >
                  <Dropdown
                    overlay={getMenu(epic)}
                    trigger={["click"]}
                    placement="bottomRight"
                    disabled={!isProjectLead}
                  >
                    <MoreOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                  </Dropdown>
                </span>
              </div>
            ))}
          </div>
          <Tooltip title="Create Epic">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
              className="w-full mt-3"
              size="middle"
              disabled={!isProjectLead}
            ></Button>
          </Tooltip>
        </div>

        <div>
          <h3 className="font-medium mb-3 text-gray-700">
            Sprints ({milestones.length})
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {milestones.map((milestone) => {
              const startDate = milestone.startDate
                ? new Date(milestone.startDate)
                : new Date();
              const endDate = milestone.endDate
                ? new Date(milestone.endDate)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={milestone._id}
                  className="p-2 bg-blue-50 rounded text-sm"
                >
                  <div className="font-medium text-blue-800 truncate">
                    {milestone.name}
                  </div>
                  <div className="text-blue-600 text-xs mt-1">
                    {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Epic Modal */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={selectedEpic ? "Edit Epic" : "Create New Epic"}
        okText={selectedEpic ? "Update" : "Create"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Epic Name"
            rules={[{ required: true, message: "Please enter epic name" }]}
          >
            <Input placeholder="Enter epic name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter epic description" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter epic description" />
          </Form.Item>
          <Form.Item
            name="milestonesId"
            label="Sprint"
            rules={[{ required: true, message: "Please select a sprint" }]}
          >
            <Select allowClear placeholder="Select sprint">
              {milestones.map((m) => (
                <Option key={m._id} value={m._id}>
                  {m.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Epic Modal */}
      {selectedEpic && (
        <Modal
          open={isModalDeleteOpen}
          onCancel={() => setIsModalDeleteOpen(false)}
          onOk={() => handleDeleteEpic(selectedEpic)}
          title="Delete Epic"
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
          }}
        >
          <p>
            Are you sure you want to delete this epic? This action cannot be
            undone.
          </p>
        </Modal>
      )}
    </div>
  );
};
