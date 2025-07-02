"use client";

import { Menu, Dropdown, Avatar, Badge, Divider, Typography } from "antd";
import {
  BellOutlined,
  MailOutlined,
  CheckSquareOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  LockOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Text } = Typography;

export default function HeaderProfileNav() {
  const menuItems = [
    {
      key: "account-title",
      label: <Text strong>accounet-title</Text>,
      type: "group" as const,
    },
    {
      key: "updates",
      label: (
        <Link href="#" passHref>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <BellOutlined /> profile
            </span>
            <Badge count={42} color="blue" />
          </div>
        </Link>
      ),
    },
    {
      key: "messages",
      label: (
        <Link href="#" passHref>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <MailOutlined /> mail
            </span>
            <Badge count={42} color="green" />
          </div>
        </Link>
      ),
    },
    {
      key: "tasks",
      label: (
        <Link href="#" passHref>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <CheckSquareOutlined /> profile task
            </span>
            <Badge count={42} color="red" />
          </div>
        </Link>
      ),
    },
    {
      key: "comments",
      label: (
        <Link href="#" passHref>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <MessageOutlined /> message
            </span>
            <Badge count={42} color="orange" />
          </div>
        </Link>
      ),
    },
    {
      key: "settings-title",
      label: <Text strong>profile setting</Text>,
      type: "group" as const,
    },
    {
      key: "profile",
      label: (
        <Link href="#">
          <span>
            <UserOutlined /> user
          </span>
        </Link>
      ),
    },
    {
      key: "settings",
      label: (
        <Link href="#">
          <span>
            <SettingOutlined /> setting
          </span>
        </Link>
      ),
    },
    {
      key: "payments",
      label: (
        <Link href="#">
          <span>
            <CreditCardOutlined /> credit card
          </span>
        </Link>
      ),
    },
    {
      key: "files",
      label: (
        <Link href="#">
          <span></span>
            <FileTextOutlined /> file text
        </Link>
      ),
    },
    {
      type: "divider" as const,
    },
    {
      key: "lock",
      label: (
        <Link href="#">
          <span>
            <LockOutlined /> lock out
          </span>
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
          <span>
            <PoweroffOutlined /> power of
          </span>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      overlayStyle={{ width: 240 }}>
      <div className="cursor-pointer d-flex align-items-center px-2">
        <Avatar
          icon={<UserOutlined />}
          size={32}
        />
      </div>
    </Dropdown>
  );
}
