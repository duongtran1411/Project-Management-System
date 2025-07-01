"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Typography,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Card,
  Row,
  Col,
  message,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import "quill/dist/quill.snow.css";
import { EmailTemplate } from "@/models/emailtemplate/EmailTemplate";
import dynamic from 'next/dynamic';

// Dữ liệu mẫu cho email templates (sẽ được thay thế bằng API call)
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

const statusOptions = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "DELETED", label: "DELETED" },
];

const { Text, Title } = Typography;
const { TextArea } = Input;
const TiptapEditor = dynamic(() => import("@/components/common/TipTapEditor"), { ssr: false });

const EmailTemplateDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Tìm template theo ID
    const foundTemplate = emailTemplates.find(t => t._id === id);
    if (foundTemplate) {
      setTemplate(foundTemplate);
    } else {
      message.error("Template not found");
      router.push("/admin/emailtemplate");
    }
  }, [id, router]);

  const startEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
  };

  const saveEdit = (field: string) => {
    if (!template) return;
    setTemplate({ ...template, [field]: editValue });
    setEditField(null);
  };

  const handleSave = async () => {
    if (!template) return;
    setLoading(true);
    try {
      // TODO: Gọi API để lưu template
      console.log("Saving template:", template);
      message.success("Template saved successfully");
    } catch (error) {
      message.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const renderEditable = (
    field: string,
    value: string,
    inputType: "input" | "textarea" | "select"
  ) => {
    if (editField === field) {
      if (inputType === "input") {
        return (
          <Input
            value={editValue}
            autoFocus
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveEdit(field)}
            onPressEnter={() => saveEdit(field)}
            size="small"
            style={{ minWidth: 300 }}
          />
        );
      }
      if (inputType === "textarea") {
        return (
          <TextArea
            value={editValue}
            autoSize={{ minRows: 2, maxRows: 6 }}
            autoFocus
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveEdit(field)}
            onPressEnter={(e) => {
              e.preventDefault();
              saveEdit(field);
            }}
            style={{ minWidth: 400 }}
          />
        );
      }
      if (inputType === "select") {
        return (
          <Select
            value={editValue}
            options={statusOptions}
            autoFocus
            onChange={(val) => {
              setEditValue(val);
              setTimeout(() => saveEdit(field), 100);
            }}
            onBlur={() => saveEdit(field)}
            style={{ minWidth: 150 }}
          />
        );
      }
    }
    if (inputType === "select") {
      return (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => startEdit(field, value)}>
          <Tag
            color={
              value === "ACTIVE"
                ? "green"
                : value === "INACTIVE"
                ? "orange"
                : "red"
            }>
            {value}
          </Tag>
        </span>
      );
    }
    return (
      <span
        style={{ cursor: "pointer" }}
        onClick={() => startEdit(field, value)}>
        {value || <Text type="secondary">(empty)</Text>}
      </span>
    );
  };

  if (!mounted || !template) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push("/admin/emailtemplate")}
          style={{ marginBottom: 16 }}
        >
          Back to Templates
        </Button>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={2}>Email Template: {template.name}</Title>
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Basic Information" style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <span style={{ color: "red" }}>*</span>
                <Text strong>Name: </Text>{" "}
                {renderEditable("name", template.name, "input")}
              </div>
              <div>
                <span style={{ color: "red" }}>*</span>
                <Text strong>Subject: </Text>{" "}
                {renderEditable("subject", template.subject, "input")}
              </div>
              <div>
                <span style={{ color: "red" }}>*</span>
                <Text strong>Status: </Text>{" "}
                {renderEditable("status", template.status, "select")}
              </div>
              <div>
                <Text strong>Variables:</Text>{" "}
                {template.variables && template.variables.length > 0 ? (
                  template.variables.map((v) => <Tag key={v}>{v}</Tag>)
                ) : (
                  <Text type="secondary">None</Text>
                )}
              </div>
            </Space>
          </Card>

          <Card title="Timestamps">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div>
                <Text strong>Created At:</Text>{" "}
                <span>{format(new Date(template.createdAt), "yyyy-MM-dd HH:mm")}</span>
              </div>
              <div>
                <Text strong>Updated At:</Text>{" "}
                <span>{format(new Date(template.updatedAt), "yyyy-MM-dd HH:mm")}</span>
              </div>
              <div>
                <Text strong>Created By:</Text>{" "}
                <span>{template.createdBy}</span>
              </div>
              <div>
                <Text strong>Updated By:</Text>{" "}
                <span>{template.updatedBy}</span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Email Content" style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>Header:</Text>
                {editField === "header" ? (
                  <TextArea
                    value={editValue}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    autoFocus
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit("header")}
                    onPressEnter={(e) => {
                      e.preventDefault();
                      saveEdit("header");
                    }}
                    style={{ minWidth: "100%" }}
                  />
                ) : (
                  <div
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 4,
                      padding: 8,
                      background: "#fafafa",
                      minHeight: 30,
                      cursor: "pointer",
                    }}
                    onClick={() => startEdit("header", template.header || "")}
                    dangerouslySetInnerHTML={{ __html: template.header || "" }}
                  />
                )}
              </div>
              
              <div>
                <span style={{ color: "red" }}>*</span>
                <Text strong>Body: </Text>
                {editField === "body" ? (
                  <div style={{ minWidth: "100%" }}>
                    <TiptapEditor
                      value={editValue}
                      onChange={(val: string) => setEditValue(val)}
                      placeholder="Nhập nội dung email..."
                      style={{ minHeight: "200px" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 4,
                      padding: 8,
                      background: "#fafafa",
                      minHeight: 60,
                      cursor: "pointer",
                    }}
                    onClick={() => startEdit("body", template.body)}
                    dangerouslySetInnerHTML={{ __html: template.body }}
                  />
                )}
              </div>
              
              <div>
                <Text strong>Footer:</Text>
                {editField === "footer" ? (
                  <TextArea
                    value={editValue}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    autoFocus
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit("footer")}
                    onPressEnter={(e) => {
                      e.preventDefault();
                      saveEdit("footer");
                    }}
                    style={{ minWidth: "100%" }}
                  />
                ) : (
                  <div
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 4,
                      padding: 8,
                      background: "#fafafa",
                      minHeight: 30,
                      cursor: "pointer",
                    }}
                    onClick={() => startEdit("footer", template.footer || "")}
                    dangerouslySetInnerHTML={{ __html: template.footer || "" }}
                  />
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmailTemplateDetailPage; 