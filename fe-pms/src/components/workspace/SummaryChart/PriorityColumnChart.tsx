"use client";
import React from "react";
import { Column } from "@ant-design/charts";

const PriorityBarChart = () => {
  const data = [
    { priority: "High", value: 0 },
    { priority: "Medium", value: 22 },
    { priority: "Low", value: 0 },
    { priority: "Urgent", value: 0 },
  ];

  const config = {
    data,
    xField: "priority",
    yField: "value",
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
      position: "middle",
      style: {
        fill: "#fff",
        fontSize: 12,
        fontWeight: 500,
      },
    },
    tooltip: {
      showMarkers: false,
    },
  };

  return (
    <div className="bg-white rounded">
      <Column {...config} />
    </div>
  );
};

export default PriorityBarChart;
