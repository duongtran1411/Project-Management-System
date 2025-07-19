"use client";

import React, { useEffect, useState } from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import { getMilestonesByProject } from "@/lib/services/milestone/milestone.service";
import { getTasksByProject } from "@/lib/services/task/task.service";
import {
  getEpicsByProject,
  createEpic,
} from "@/lib/services/epic/epic.service";
import { useParams } from "next/navigation";
import { Milestone } from "@/models/milestone/milestone.model";
import { Epic } from "@/models/epic/epic.model";
import { Button, Form, Input, Select, Modal } from "antd";

const { Option } = Select;

const TimelinePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [groups, setGroups] = useState<any[]>([]); // sprint
  const [items, setItems] = useState<any[]>([]); // task
  const [epics, setEpics] = useState<Epic[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // Load data
  useEffect(() => {
    if (!projectId) return;
    getMilestonesByProject(projectId).then((data) => {
      setMilestones(data);
      setGroups(data.map((m) => ({ id: m._id, title: m.name })));
    });
    getTasksByProject(projectId).then((data) => {
      if (!Array.isArray(data)) return;
      setItems(
        data
          .map((task: any) => ({
            id: task._id,
            group:
              task.milestones && task.milestones._id
                ? task.milestones._id
                : undefined, // gán task vào sprint nếu có
            title: task.name,
            start_time: task.startDate
              ? new Date(task.startDate).getTime()
              : task.dueDate
              ? new Date(task.dueDate).getTime()
              : Date.now(),
            end_time: task.dueDate
              ? new Date(task.dueDate).getTime()
              : task.startDate
              ? new Date(task.startDate).getTime()
              : Date.now(),
          }))
          .filter((item: any) => !!item.group)
      );
    });
    getEpicsByProject(projectId).then(setEpics);
  }, [projectId]);

  // Tạo Epic
  const handleCreateEpic = async (values: any) => {
    await createEpic({ ...values, projectId });
    setOpen(false);
    getEpicsByProject(projectId).then(setEpics);
    form.resetFields();
  };

  return (
    <div className="flex h-full">
      {/* Sidebar tạo Epic */}
      <div className="w-64 border-r p-4 bg-white">
        <h3 className="font-bold mb-2">Epics</h3>
        <ul className="mb-4">
          {epics.map((epic) => (
            <li key={epic._id} className="truncate">
              {epic.name}
            </li>
          ))}
        </ul>
        <Button type="primary" onClick={() => setOpen(true)} block>
          + Tạo Epic
        </Button>
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => form.submit()}
          title="Tạo Epic mới"
          okText="Tạo"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical" onFinish={handleCreateEpic}>
            <Form.Item
              name="name"
              label="Tên Epic"
              rules={[{ required: true }]}
            >
              {" "}
              <Input />{" "}
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              {" "}
              <Input.TextArea rows={2} />{" "}
            </Form.Item>
            <Form.Item name="milestonesId" label="Sprint">
              <Select allowClear placeholder="Chọn sprint">
                {milestones.map((m) => (
                  <Option key={m._id} value={m._id}>
                    {m.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      {/* Timeline */}
      <div className="flex-1 p-4 bg-gray-50">
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={groups[0] ? Date.now() : Date.now()}
          defaultTimeEnd={
            groups[0]
              ? Date.now() + 7 * 24 * 60 * 60 * 1000
              : Date.now() + 7 * 24 * 60 * 60 * 1000
          }
          groupRenderer={({ group }) => <span>{group.title}</span>}
        />
      </div>
    </div>
  );
};

export default TimelinePage;
