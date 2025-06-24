"use client";

import React, { useState } from "react";
import { Card, Avatar, Button, Input, Dropdown, Checkbox } from "antd";
import { PlusOutlined, DownOutlined } from "@ant-design/icons";

const epicOptions = [
  { label: "SDS Document", value: "SDS DOCUMENT", id: "SCRUM-16" },
  { label: "BACKEND-API", value: "BACKEND-API", id: "SCRUM-43" },
  { label: "CLIENT", value: "CLIENT", id: "SCRUM-44" },
];

type Task = {
  id: string;
  title: string;
  assignee: string;
  tags: string[];
  dueDate: string;
};

const BoardPage = () => {
  const [search, setSearch] = useState("");
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [epicOpen, setEpicOpen] = useState(false);

  const columns: { title: string; tasks: Task[] }[] = [
    {
      title: "TO DO",
      tasks: [
        {
          id: "SCRUM-53",
          title: "api add member",
          assignee: "LV",
          tags: ["CLIENT"],
          dueDate: "Jun 27, 2025",
        },
        {
          id: "SCRUM-54",
          title: "Backlog",
          assignee: "TD",
          tags: ["CLIENT"],
          dueDate: "Jun 27, 2025",
        },
        {
          id: "SCRUM-55",
          title: "api add project to workspace",
          assignee: "LV",
          tags: ["CLIENT"],
          dueDate: "Jun 27, 2025",
        },
      ],
    },
    {
      title: "IN PROGRESS",
      tasks: [],
    },
    {
      title: "DONE",
      tasks: [
        {
          id: "SCRUM-36",
          title: "Design Code Packages",
          assignee: "TD",
          tags: ["SDS DOCUMENT"],
          dueDate: "Jun 20, 2025",
        },
        {
          id: "SCRUM-23",
          title: "View List User",
          assignee: "NS",
          tags: ["BACKEND-API"],
          dueDate: "Jun 20, 2025",
        },
        {
          id: "SCRUM-27",
          title: "View statistical project",
          assignee: "LV",
          tags: ["BACKEND-API"],
          dueDate: "Jun 20, 2025",
        },
      ],
    },
  ];

  const getAssigneeColor = (assignee: string) => {
    const colors: { [key: string]: string } = {
      LV: "bg-purple-600",
      TD: "bg-purple-600",
      NS: "bg-purple-600",
    };
    return colors[assignee] || "bg-gray-400";
  };

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      CLIENT: "bg-purple-100 text-purple-600",
      "SDS DOCUMENT": "bg-purple-100 text-purple-600",
      "BACKEND-API": "bg-purple-100 text-purple-600",
    };
    return colors[tag] || "bg-gray-100 text-gray-600";
  };

  // Lọc task theo search và epic
  const filterTasks = (tasks: Task[]) => {
    return tasks.filter((task) => {
      const matchSearch =
        search.trim() === "" ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.id.toLowerCase().includes(search.toLowerCase());
      const matchEpic =
        selectedEpics.length === 0 ||
        task.tags.some((tag: string) => selectedEpics.includes(tag));
      return matchSearch && matchEpic;
    });
  };

  // Dropdown content cho Epic
  const epicDropdown = (
    <div className="bg-white rounded-lg shadow-lg p-2 min-w-[220px]">
      {epicOptions.map((epic) => (
        <div
          key={epic.value}
          className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50"
        >
          <Checkbox
            checked={selectedEpics.includes(epic.value)}
            onChange={() => {
              setSelectedEpics((prev) =>
                prev.includes(epic.value)
                  ? prev.filter((e) => e !== epic.value)
                  : [...prev, epic.value]
              );
            }}
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
          <Button
            className="flex items-center font-semibold text-gray-700 "
            icon={null}
          >
            Epic <DownOutlined className="ml-1 " />
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
      <div className="flex gap-4">
        {columns.map((column, index) => (
          <div
            key={index}
            className="flex-1 min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-700">{column.title}</h2>
                <span className="text-gray-500">
                  {filterTasks(column.tasks).length}
                </span>
              </div>
              {column.title === "TO DO" && (
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
              {filterTasks(column.tasks).map((task: Task) => (
                <Card
                  key={task.id}
                  className="transition-shadow shadow-sm cursor-pointer hover:shadow-md"
                  styles={{ body: { padding: "12px" } }}
                >
                  <div className="space-y-2">
                    <p className="text-gray-700">{task.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
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
                      <span
                        className={`font-medium text-gray-600 ${
                          column.title === "DONE" ? "line-through" : ""
                        }`}
                      >
                        {task.id}
                      </span>
                      <Avatar
                        className={`${getAssigneeColor(
                          task.assignee
                        )} text-white`}
                        size="small"
                      >
                        {task.assignee}
                      </Avatar>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardPage;
