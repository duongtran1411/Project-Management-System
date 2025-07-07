"use client";
import Spinner from "@/components/common/spinner/spin";
import { showErrorToast } from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { Statistical } from "@/models/statistical/Statistical";
import {
  FileTextOutlined,
  ProjectOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Bar, Pie } from "@ant-design/charts";
export default function Dashboard() {
  const [statistical, setStatistical] = useState<Statistical>();

  const getStatistics = async (url: string): Promise<Statistical> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
         error.response?.data?.message  || error.message || "đã có lỗi xảy ra";
      if (errorMessage) showErrorToast(errorMessage);
    }
    return Promise.reject();
  };
  const { data, error, isLoading } = useSWR(
    `${Endpoints.Statistical.GET_STATISTICAL}`,
    getStatistics
  );

  useEffect(() => {
    if (data) {
      setStatistical(data);
    }
  }, [data]);

  if (error) {
    showErrorToast(error.message);
  }

  if (isLoading) {
    return <Spinner />;
  }

  const stats = [
    {
      label: "Total Workspace",
      value: statistical?.totalProjects,
      icon: (
        <span className="p-3 bg-green-100 rounded-full">
          <svg
            className="w-6 h-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path d="M12 4.5C7.305 4.5 3.135 7.305 1.5 12c1.635 4.695 5.805 7.5 10.5 7.5s8.865-2.805 10.5-7.5C20.865 7.305 16.695 4.5 12 4.5z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
      ),
      change: "+0.43%",
      changeType: "up",
      color: "text-green-500",
    },
    {
      label: "Total Project",
      value: statistical?.totalProjects,
      icon: (
        <span className="p-3 bg-orange-100 rounded-full">
          <ProjectOutlined />
        </span>
      ),
      change: "+4.35%",
      changeType: "up",
      color: "text-green-500",
    },
    {
      label: "Total Task",
      value: statistical?.totalTasks,
      icon: (
        <span className="p-3 bg-purple-100 rounded-full">
          <FileTextOutlined />
        </span>
      ),
      change: "+2.59%",
      changeType: "up",
      color: "text-green-500",
    },
    {
      label: "Total Users",
      value: statistical?.totalUsers,
      icon: (
        <span className="p-3 bg-blue-100 rounded-full">
          <UserOutlined />
        </span>
      ),
      change: "-0.95%",
      changeType: "down",
      color: "text-red-500",
    },
  ];

  const projectStatus = statistical?.projectStatusStats?.map((e) => ({
    status: e.status,
    value: e.count,
  }));

  const configProject = {
    data: projectStatus,
    xField: "status",
    yField: "value",
    colorField: "status",
    barWidthRatio: 0.8
  };

  const taskStatus = statistical?.taskStatusStats?.map((e)=>({
    status: e.status,
    value: e.count
  }));

  const configTask = {
    data: taskStatus,
    angleField: "value", 
    colorField: "status", 
    radius: 1, 
    label: {
      type: "spider",
      labelHeight: 28,
      content: "{status}\n{percentage}",
    },
    interactions: [
      {
        type: "element-active", 
      },
    ]
  };

  return (
    <div className="bg-[#F3F4F6]">
      <div className="grid grid-cols-1 gap-6 px-10 mb-8 md:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 p-6 bg-white shadow rounded-xl">
            <div className="flex items-center gap-3">
              {stat.icon}
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <span
                className={
                  stat.changeType === "up" ? "text-green-500" : "text-red-500"
                }>
                {stat.change}
              </span>
              <span
                className={
                  "inline-flex items-center justify-center w-5 h-5 rounded-full " +
                  (stat.changeType === "up" ? "bg-green-100" : "bg-red-100")
                }>
                {stat.changeType === "up" ? (
                  <svg
                    className="w-3 h-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path
                      d="M12 19V5M5 12l7-7 7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path
                      d="M12 5v14M19 12l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      
      <div className="grid grid-cols-1 gap-6 px-10 pb-10 md:grid-cols-2">
        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Project Overview</h2>
            
          </div>
          
          <div className="flex items-center justify-center h-48 text-gray-400">
            {Array.isArray(statistical?.projectStatusStats) && statistical?.projectStatusStats && (
                <Bar {...configProject}/>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <div>
              <div className="text-xs text-gray-500"></div>
              <div className="text-lg font-bold"></div>
            </div>
            <div>
              <div className="text-xs text-gray-500"></div>
              <div className="text-lg font-bold"></div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Status Task</h2>
          </div>
          <div className="flex items-center justify-center h-48 text-gray-400">
             {Array.isArray(statistical?.taskStatusStats) && statistical?.taskStatusStats && (
                <Pie {...configTask}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
