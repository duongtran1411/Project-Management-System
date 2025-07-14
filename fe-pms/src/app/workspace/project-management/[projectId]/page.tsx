"use client";

import React, { useEffect, useState } from "react";
import { Card, Avatar, Button, Input, Dropdown, Checkbox } from "antd";
import { PlusOutlined, DownOutlined } from "@ant-design/icons";
import DetailTaskModal from "./board/detail-task/page";
import { getTasksByProject } from "@/lib/services/task/task";
import { UITask, TaskApiResponse } from "@/types/types";
import { useParams } from "next/navigation";

const epicOptions = [
  { label: "SDS Document", value: "SDS DOCUMENT", id: "SCRUM-16" },
  { label: "BACKEND-API", value: "BACKEND-API", id: "SCRUM-43" },
  { label: "CLIENT", value: "CLIENT", id: "SCRUM-44" },
];

const BoardPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [search, setSearch] = useState("");
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [epicOpen, setEpicOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UITask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<UITask[]>([]);

  // Format ngày
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Chuyển đổi dữ liệu từ API thành dữ liệu hiển thị
  const mapTaskData = (data: TaskApiResponse[]): UITask[] => {
    return data.map((item) => ({
      id: item._id || "",
      title: item.name || "",
      assignee: item.assignee?.fullName || "Unassigned",
      tags: [item.epic?.name || "No Epic"],
      dueDate: formatDate(item.dueDate),
      status: item.status || "TO_DO",
      priority: item.priority || "Medium",
      raw: item,
    }));
  };

  // Gọi API lấy task
  useEffect(() => {
    if (!projectId) return;
    const fetchTasks = async () => {
      const data: unknown = await getTasksByProject(projectId);
      if (Array.isArray(data)) {
        setTasks(mapTaskData(data as TaskApiResponse[]));
      }
    };
    fetchTasks();
  }, [projectId]);

  // Filter task theo status
  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => task.status === status);

  // Lọc theo search + epic
  const filterTasks = (tasks: UITask[]) =>
    tasks.filter((task) => {
      const matchSearch =
        search.trim() === "" ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.id.toLowerCase().includes(search.toLowerCase());
      const matchEpic =
        selectedEpics.length === 0 ||
        task.tags.some((tag) => selectedEpics.includes(tag));
      return matchSearch && matchEpic;
    });

  const columnDefs = [
    { title: "TO DO", status: "TO_DO" },
    { title: "IN PROGRESS", status: "IN_PROGRESS" },
    { title: "DONE", status: "DONE" },
  ];

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      CLIENT: "bg-purple-100 text-purple-600",
      "SDS DOCUMENT": "bg-purple-100 text-purple-600",
      "BACKEND-API": "bg-purple-100 text-purple-600",
    };
    return colors[tag] || "bg-gray-100 text-gray-600";
  };

  const epicDropdown = (
    <div className="bg-white rounded-lg shadow-lg p-2 min-w-[220px]">
      {epicOptions.map((epic) => (
        <div
          key={epic.value}
          className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50"
        >
          <Checkbox
            checked={selectedEpics.includes(epic.value)}
            onChange={() =>
              setSelectedEpics((prev) =>
                prev.includes(epic.value)
                  ? prev.filter((e) => e !== epic.value)
                  : [...prev, epic.value]
              )
            }
          >
            <span className="font-medium">{epic.label}</span>
            <div className="ml-2 text-xs text-gray-500">{epic.id}</div>
          </Checkbox>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Input.Search
          placeholder="Search board"
          allowClear
          className="w-[260px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Dropdown
          open={epicOpen}
          onOpenChange={setEpicOpen}
          popupRender={() => epicDropdown}
          trigger={["click"]}
        >
          <Button className="flex items-center font-semibold text-gray-700">
            Epic <DownOutlined className="ml-1" />
          </Button>
        </Dropdown>
        <Button
          type="text"
          onClick={() => {
            setSearch("");
            setSelectedEpics([]);
          }}
          className="font-semibold text-gray-600"
        >
          Clear Filters
        </Button>
      </div>

      {/* Task Columns */}
      <div className="flex gap-4">
        {columnDefs.map((col) => {
          const filtered = filterTasks(getTasksByStatus(col.status));
          return (
            <div
              key={col.status}
              className="flex-1 min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-700">{col.title}</h2>
                  <span className="text-gray-500">{filtered.length}</span>
                </div>
                {col.status === "TO_DO" && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    className="!flex items-center"
                  >
                    Create
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {filtered.map((task) => (
                  <Card
                    key={task.id}
                    className="transition-shadow shadow-sm cursor-pointer hover:shadow-md"
                    styles={{ body: { padding: "12px" } }}
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="space-y-2">
                      <p
                        className={`text-gray-700 ${col.status === "DONE" ? "line-through" : ""
                          }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getTagColor(
                              tag
                            )}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{task.dueDate}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">
                          {task.priority}
                        </span>
                        <Avatar
                          className="text-white bg-purple-600"
                          size="small"
                        >
                          {task.assignee?.[0] || "?"}
                        </Avatar>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedTask && (
        <DetailTaskModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
        />
      )}

    </div>
  );
};

export default BoardPage;
