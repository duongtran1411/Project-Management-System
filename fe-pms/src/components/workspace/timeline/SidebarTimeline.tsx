"use client";

import {
  createEpic,
  getEpicsByProject,
} from "@/lib/services/epic/epic.service";
import { Epic } from "@/models/epic/epic.model";
import { Milestone } from "@/models/milestone/milestone.model";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Tooltip } from "antd";
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
  const handleCreateEpic = async (values: any) => {
    await createEpic({ ...values, projectId });
    setOpen(false);
    form.resetFields();
    // Refresh epics
    getEpicsByProject(projectId).then(setEpics);
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
              <div key={epic._id} className="p-2 bg-purple-50 rounded text-sm">
                <div className="font-medium text-purple-800 truncate">
                  {epic.name}
                </div>
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
        title="Create New Epic"
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateEpic}>
          <Form.Item
            name="name"
            label="Epic Name"
            rules={[{ required: true, message: "Please enter epic name" }]}
          >
            <Input placeholder="Enter epic name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter epic description" />
          </Form.Item>
          <Form.Item name="milestonesId" label="Sprint">
            <Select allowClear placeholder="Select sprint (optional)">
              {milestones.map((m) => (
                <Option key={m._id} value={m._id}>
                  {m.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            label="End date"
            name="endDate"
            rules={[{ required: true, message: "End date is required" }]}
          >
            <DatePicker
              showTime
              disabledDate={(current) => {
                const startDate = form.getFieldValue("startDate");
                return startDate && current.isBefore(startDate, "day");
              }}
            />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};
