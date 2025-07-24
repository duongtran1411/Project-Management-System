"use client";

import { Card, Tabs, Badge, List, Checkbox, Spin, Alert } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProjectsContributorByUserId } from "@/lib/services/projectContributor/projectContributor.service";
import { AssignedTaskItem } from "@/types/types";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { useAuth } from "@/lib/auth/auth-context";
import { Project } from "@/models/project/project.model";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const useTasksByAssignee = (userId?: string) => {
  const shouldFetch = !!userId;
  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_ASSIGNEE(
        userId
      )}`
      : null,
    fetcher
  );
  return {
    data: data?.data || [],
    error,
    isLoading,
  };
};

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { userInfo } = useAuth();
  useEffect(() => {
    setUserId(userInfo?.userId || null);

    if (!userInfo?.userId) return;

    const fetchProjects = async () => {
      const data = await getProjectsContributorByUserId(userInfo?.userId);
      if (Array.isArray(data)) {
        const filteredProjects = data.filter(
          (proj): proj is Project => proj !== null
        );
        setProjects(filteredProjects);
      }
    };

    fetchProjects();
  }, []);

  const {
    data: rawTasks,
    error,
    isLoading: isTasksLoading,
  } = useTasksByAssignee(userId || undefined);

  const groupTasksByStatus = (tasks: AssignedTaskItem[]) => {
    const sections = [
      { status: "TO DO", items: [] as AssignedTaskItem[] },
      { status: "IN PROGRESS", items: [] as AssignedTaskItem[] },
      { status: "DONE", items: [] as AssignedTaskItem[] },
    ];

    tasks.forEach((task) => {
      const taskStatus = task.status?.toUpperCase()?.replace("_", " ");
      const section = sections.find((s) => s.status === taskStatus);
      if (section) section.items.push(task);
    });

    return sections;
  };

  const assignedTasksByStatus = useMemo(() => {
    if (!rawTasks) return [];
    return groupTasksByStatus(rawTasks);
  }, [rawTasks]);

  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-2xl font-semibold mb-7">For you</h1>
      <div className="w-full mb-4 border-b border-gray-200"></div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium">Recent projects</div>
          <Link
            href="/workspace/viewall"
            className="text-sm text-blue-600 hover:underline"
          >
            View all projects
          </Link>
        </div>

        <div className="flex gap-4 mb-6">
          {projects.map((proj, idx) => (
            <Card
              key={idx}
              className="p-0 shadow-sm w-72"
              styles={{ body: { padding: 0 } }}
            >
              <div className="flex">
                <div className="w-4 bg-blue-100 rounded-l"></div>
                <div className="flex-1">
                  <div className="flex items-center p-4 space-x-3">
                    <img
                      src="https://fpt-team-zwu4t30d.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10408?size=medium"
                      alt=""
                      className="object-cover w-8 h-8 rounded"
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold leading-5">
                        {proj.name}
                      </div>
                      <div className="text-sm font-semibold text-gray-500">
                        {proj.projectType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 mt-2 text-sm text-gray-600">
                    <span>My open work items</span>
                    <Badge count={0} color="#d1d5db" />
                  </div>
                  <div className="pl-4 mt-1 text-sm text-gray-600">
                    Done work items
                  </div>
                  <Link
                    href={`/workspace/project-management/${proj._id}/board`}
                    className="flex items-center justify-between block px-4 py-2 mt-4 text-xs text-gray-500 transition border-t border-gray-200 hover:bg-gray-100"
                  >
                    <span>Board</span>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Tabs
        defaultActiveKey="assigned"
        className="mb-4"
        items={[
          { key: "worked", label: "Worked on" },
          { key: "viewed", label: "Viewed" },
          {
            key: "assigned",
            label: (
              <span>
                Assigned to me{" "}
                <Badge
                  color="#d1d5db"
                  count={rawTasks?.length || 0}
                  className="ml-1"
                />
              </span>
            ),
            children: (
              <>
                {isTasksLoading ? (
                  <Spin />
                ) : error ? (
                  <Alert message="Error loading tasks" type="error" />
                ) : (
                  <div>
                    {assignedTasksByStatus.map((section, idx) => {
                      if (section.items.length === 0) return null; // Không hiển thị nếu không có task
                      return (
                        <div key={idx} className="mb-4">
                          <div className="mb-2 text-xs font-semibold text-gray-500">
                            {section.status}
                          </div>
                          <List
                            dataSource={section.items}
                            renderItem={(item: AssignedTaskItem) => (
                              <List.Item className="flex items-center">
                                <Checkbox checked={true} className="mr-4" />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {item.projectId?.name}
                                  </div>
                                </div>

                                <div className="ml-auto text-xs text-gray-400">
                                  {item.status}
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ),
          },
          { key: "starred", label: "Starred" },
          { key: "boards", label: "Boards" },
        ]}
      />
    </div>
  );
}
