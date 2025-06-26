"use client";
import React from "react";
import { Pie } from "@ant-design/charts";

const StatusOverviewChart = () => {
  const data = [
    { type: "To Do", value: 18 },
    { type: "In Progress", value: 7 },
    { type: "Done", value: 24 },
  ];

  const config = {
    data,
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.7,
    height: 240,

    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
      marginRight: 20,
      fontSize: 16,
    },
    annotations: [
      {
        type: "text",
        data: [],
        style: {
          text: "Total work items: 49",
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
      type: "outer",
      offset: "-30%",
      content: "{value}%",
      style: {
        textAlign: "center",
        fontSize: 16,
        autoFit: true,
      },
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
