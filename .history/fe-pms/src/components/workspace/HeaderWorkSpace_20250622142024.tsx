"use client";
import React from "react";
import { Button, Input, Badge, Avatar, Space, Typography } from "antd";
import {
  AppstoreOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  SearchOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import Image from "next/image";

const HeaderWorkSpace = () => {
  return (
    <header className="bg-white px-4 py-2 flex items-center justify-between w-full border-b border-gray-200">
      <div className="flex items-center gap-x-3">
        <Button
          type="text"
          icon={<AppstoreOutlined className="text-xl text-gray-600" />}
        />
        <div className="flex items-center gap-x-1">
          <Image src="/jira_icon.png" alt="Jira Logo" width={24} height={24} />
          <Typography.Text strong className="text-xl font-semibold">
            Jira
          </Typography.Text>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <Input
          size="large"
          placeholder="Search"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="bg-gray-100"
        />
      </div>

      <div className="flex items-center gap-x-4">
        <Button type="primary" size="large">
          Create
        </Button>
        <Button size="large">
          <Space>
            <MessageOutlined />
            <span>Rovo Chat</span>
          </Space>
        </Button>
        <Badge count="9+">
          <BellOutlined className="text-2xl text-gray-600" />
        </Badge>
        <QuestionCircleOutlined className="text-2xl text-gray-600" />
        <SettingOutlined className="text-2xl text-gray-600" />
        <Avatar size="large" className="bg-purple-600 cursor-pointer">
          NH
        </Avatar>
      </div>
    </header>
  );
};

export default HeaderWorkSpace;
