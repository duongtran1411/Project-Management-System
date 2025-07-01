"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Typography,
  Button,
  Tag,
  Space,
  Input,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { format } from "date-fns";
import "quill/dist/quill.snow.css";
import { EmailTemplate } from "@/models/emailtemplate/EmailTemplate";
import dynamic from 'next/dynamic';
// Dữ liệu mẫu cho email templates
const emailTemplates: EmailTemplate[] = [
  {
    _id: "1",
    name: "VERIFY_EMAIL",
    subject: "Verify your email address",
    header: "<h2>Welcome!</h2>",
    body: '<p>Please click the link below to verify your email address:</p><a href="{verify_link}">Verify Email</a>',
    footer: "<p>Thank you!</p>",
    variables: ["verify_link"],
    status: "ACTIVE",
    createdBy: "admin",
    updatedBy: "admin",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-05-02T12:00:00Z",
  },
  {
    _id: "2",
    name: "RESET_PASSWORD",
    subject: "Reset your password",
    header: "",
    body: '<p>Click the link to reset your password: <a href="{reset_link}">Reset Password</a></p>',
    footer: "",
    variables: ["reset_link"],
    status: "INACTIVE",
    createdBy: "admin",
    updatedBy: "admin",
    createdAt: "2024-04-20T09:00:00Z",
    updatedAt: "2024-04-21T11:00:00Z",
  },
];

const columns: ColumnsType<EmailTemplate> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Subject",
    dataIndex: "subject",
    key: "subject",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: EmailTemplate["status"]) => {
      let color = "default";
      if (status === "ACTIVE") color = "green";
      else if (status === "INACTIVE") color = "orange";
      else if (status === "DELETED") color = "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date: string) => format(new Date(date), "yyyy-MM-dd"),
  },
  {
    title: "Updated At",
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: (date: string) => format(new Date(date), "yyyy-MM-dd"),
  },
];

const statusOptions = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "DELETED", label: "DELETED" },
];

const { Text, Title } = Typography;
const { TextArea } = Input;
const TiptapEditor = dynamic(() => import("@/components/common/TipTapEditor"), { ssr: false });
const EmailTemplatePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onRowClick = (record: EmailTemplate) => {
    router.push(`/admin/emailtemplate/${record._id}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2}>Email Templates</Title>
        <Button type="primary" onClick={() => router.push("/admin/emailtemplate/new")}>
          Create New Template
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={emailTemplates}
        rowKey="_id"
        onRow={(record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: "pointer" },
        })}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default EmailTemplatePage;
