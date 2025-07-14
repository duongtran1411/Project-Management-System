"use client";
import React from "react";
import { Pie } from "@ant-design/charts";
import { TaskStatistic } from "@/types/types";
import { Spin } from "antd";

interface Props {
  taskStatistic?: TaskStatistic;
}

const StatusOverviewChart: React.FC<Props> = ({ taskStatistic }) => {
  if (!taskStatistic)
    return (
      <Spin size="large" tip="Loading...">
        <div className="p-10" />
      </Spin>
    );

  const config = {
    data: taskStatistic?.taskStatusStats,
    angleField: "count",
    colorField: "status",
    radius: 1,
    innerRadius: 0.7,
    height: 240,
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
    annotations: [
      {
        type: "text",
        data: [],
        style: {
          text: `Total work items:${taskStatistic?.totalTasks}`,
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 50,
          fontStyle: "semibold",
        },
      },
    ],
    statistic: {
      title: false,
      content: {
        customHtml: () => `
      <div style="text-align:center;">
        <div style="font-size:24px;">49</div>
        <div>Total</div>
      </div>
    `,
      },
    },

    label: {
      position: "outside",
      offset: "-30%",
      //content: "{value}%",
      text: (data: any) => `${data.percentage}%`,
    },
    interactions: [{ type: "element-active" }],
  };

  return (
    <div>
      <Pie {...config} />
    </div>
  );
};

export default StatusOverviewChart;
