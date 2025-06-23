"use client";
import React from "react";
import { Button, Input, Badge, Avatar, Typography } from "antd";
import {
  BellOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  SearchOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Image from "next/image";

const HeaderWorkSpace = ({ onCollapse }: { onCollapse: () => void }) => {
  return (
    <header className="bg-white px-4 py-2 flex items-center justify-between w-full border-b border-gray-300">
      {/* Left */}
      <div className="flex items-center gap-x-3">
        <Button
          type="text"
          icon={<MenuUnfoldOutlined className="text-xl text-gray-600" />}
          onClick={onCollapse}
        />
        <div className="flex items-center gap-x-1">
          <Image src="/jira_icon.png" alt="Jira Logo" width={24} height={24} />
          <Typography.Text strong className="text-xl font-semibold">
            Hub
          </Typography.Text>
        </div>
      </div>

      {/* Center */}
      <div className="flex  mx-4 gap-[10px] items-center justify-center">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="bg-gray-100 w-[780px] h-[32px]"
        />
        <Button className="bg-[#1868db] text-white">
          <PlusOutlined />
          Create
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-x-4">
        <Badge count="9+">
          <BellOutlined className="text-lg text-gray-600" />
        </Badge>
        <QuestionCircleOutlined className="text-lg text-gray-600" />
        <SettingOutlined className="text-lg text-gray-600" />
        <Avatar className="bg-purple-600 cursor-pointer">NH</Avatar>
      </div>
    </header>
  );
};

export default HeaderWorkSpace;
