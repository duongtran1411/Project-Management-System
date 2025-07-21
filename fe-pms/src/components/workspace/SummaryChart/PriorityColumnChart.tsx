"use client";
import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/charts";
import axiosService from "@/lib/services/axios.service";
import { Endpoints } from "@/lib/endpoints";
import { useParams } from "next/navigation";
import {
  PriorityStat,
  PriorityStatsResponse,
} from "@/models/statistic/statistic.model";

const PriorityBarChart = () => {
  const [data, setData] = useState<PriorityStat[]>([]);
  const params = useParams();
  const projectId = params.projectId as string;
  const getStatisticPriority = async (
    url: string
  ): Promise<PriorityStatsResponse> => {
    const response = await axiosService.getAxiosInstance().get(url);
    return response?.data;
  };

  useEffect(() => {
    const fetchData = async (projectId: string) => {
      try {
        const response = await getStatisticPriority(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }${Endpoints.Statistics.TASK_PRIORITY(projectId)}`
        );
        setData(response?.priorityStats);
        console.log("Statistics", response);
      } catch (error) {
        console.error("Error fetching priority data:", error);
      }
    };
    if (projectId) {
      fetchData(projectId);
    }
  }, [projectId]);

  const config = {
    data,
    xField: "priority",
    yField: "count",
    yAxis: {
      tickInterval: 10,
    },
    height: 240,
    columnWidthRatio: 0.6,
    color: "#8c8c8c", // Màu xám trung tính cho cột
    legend: {
      position: "bottom",
      marker: {
        symbol: "square",
        style: {
          r: 6,
        },
      },
    },
    label: {
      position: "inside",
      style: {
        fill: "#fff",
        fontSize: 12,
        fontWeight: 500,
      },
    },
    //tooltip: false,
    tooltip: {
      showMarkers: false,
      // formatter: (datum: any) => ({
      //   name: datum.priority,
      //   value: `${datum.count} tasks (${datum.percentage}%)`,
      // }),
    },
  };

  return (
    <div className="bg-white rounded">
      <Column {...config} />
    </div>
  );
};

export default PriorityBarChart;
