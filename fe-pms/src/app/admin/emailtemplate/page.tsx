'use client'
import React, { useState } from 'react';
import { Table, Drawer, Typography, Button, Tag, Space, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
// @ts-ignore
import type ReactQuillType from 'react-quill';
import 'quill/dist/quill.snow.css';
import { EmailTemplate } from '@/models/emailtemplate/EmailTemplate';
// Dữ liệu mẫu cho email templates
const emailTemplates: EmailTemplate[] = [
  {
    _id: '1',
    name: 'VERIFY_EMAIL',
    subject: 'Verify your email address',
    header: '<h2>Welcome!</h2>',
    body: '<p>Please click the link below to verify your email address:</p><a href="{verify_link}">Verify Email</a>',
    footer: '<p>Thank you!</p>',
    variables: ['verify_link'],
    status: 'ACTIVE',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-02T12:00:00Z',
  },
  {
    _id: '2',
    name: 'RESET_PASSWORD',
    subject: 'Reset your password',
    header: '',
    body: '<p>Click the link to reset your password: <a href="{reset_link}">Reset Password</a></p>',
    footer: '',
    variables: ['reset_link'],
    status: 'INACTIVE',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-04-20T09:00:00Z',
    updatedAt: '2024-04-21T11:00:00Z',
  },
];

const columns: ColumnsType<EmailTemplate> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Subject',
    dataIndex: 'subject',
    key: 'subject',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: EmailTemplate['status']) => {
      let color = 'default';
      if (status === 'ACTIVE') color = 'green';
      else if (status === 'INACTIVE') color = 'orange';
      else if (status === 'DELETED') color = 'red';
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => format(new Date(date), 'yyyy-MM-dd'),
  },
  {
    title: 'Updated At',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (date: string) => format(new Date(date), 'yyyy-MM-dd'),
  },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'DELETED', label: 'DELETED' },
];

const { Text, Title } = Typography;
const { TextArea } = Input;

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const EmailTemplatePage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const onRowClick = (record: EmailTemplate) => {
    setSelected(record);
    setOpen(true);
    setEditField(null);
  };

  const startEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
  };

  const saveEdit = (field: string) => {
    if (!selected) return;
    setSelected({ ...selected, [field]: editValue });
    setEditField(null);
  };

  const renderEditable = (field: string, value: string, inputType: 'input' | 'textarea' | 'select') => {
    if (editField === field) {
      if (inputType === 'input') {
        return (
          <Input
            value={editValue}
            autoFocus
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => saveEdit(field)}
            onPressEnter={() => saveEdit(field)}
            size="small"
            style={{ minWidth: 180 }}
          />
        );
      }
      if (inputType === 'textarea') {
        return (
          <TextArea
            value={editValue}
            autoSize={{ minRows: 2, maxRows: 6 }}
            autoFocus
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => saveEdit(field)}
            onPressEnter={e => { e.preventDefault(); saveEdit(field); }}
            style={{ minWidth: 220 }}
          />
        );
      }
      if (inputType === 'select') {
        return (
          <Select
            value={editValue}
            options={statusOptions}
            autoFocus
            onChange={val => { setEditValue(val); setTimeout(() => saveEdit(field), 100); }}
            onBlur={() => saveEdit(field)}
            style={{ minWidth: 120 }}
          />
        );
      }
    }
    if (inputType === 'select') {
      return (
        <span style={{ cursor: 'pointer' }} onClick={() => startEdit(field, value)}>
          <Tag color={value === 'ACTIVE' ? 'green' : value === 'INACTIVE' ? 'orange' : 'red'}>{value}</Tag>
        </span>
      );
    }
    return (
      <span style={{ cursor: 'pointer' }} onClick={() => startEdit(field, value)}>{value || <Text type="secondary">(empty)</Text>}</span>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Email Templates</Title>
      <Table
        columns={columns}
        dataSource={emailTemplates}
        rowKey="_id"
        onRow={(record) => ({ onClick: () => onRowClick(record), style: { cursor: 'pointer' } })}
        pagination={false}
        bordered
      />
      <Drawer
        title="Email Template Details"
        placement="right"
        width={600}
        onClose={() => setOpen(false)}
        open={open}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="primary" onClick={() => { if(selected) console.log('Save', selected); }}>
              Save
            </Button>
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selected && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <span style={{color: 'red'}}>*</span><Text strong>Name: </Text> {renderEditable('name', selected.name, 'input')}
            </div>
            <div>
              <span style={{color: 'red'}}>*</span><Text strong>Subject: </Text> {renderEditable('subject', selected.subject, 'input')}
            </div>
            <div>
              <span style={{color: 'red'}}>*</span><Text strong>Status: </Text> {renderEditable('status', selected.status, 'select')}
            </div>
            <div>
              <Text strong>Variables:</Text> {selected.variables && selected.variables.length > 0 ? selected.variables.map(v => <Tag key={v}>{v}</Tag>) : <Text type="secondary">None</Text>}
            </div>
            <div>
              <Text strong>Header:</Text>
              {editField === 'header' ? (
                <TextArea
                  value={editValue}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  autoFocus
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => saveEdit('header')}
                  onPressEnter={e => { e.preventDefault(); saveEdit('header'); }}
                  style={{ minWidth: 220 }}
                />
              ) : (
                <div
                  style={{ border: '1px solid #eee', borderRadius: 4, padding: 8, background: '#fafafa', minHeight: 30, cursor: 'pointer' }}
                  onClick={() => startEdit('header', selected.header || '')}
                  dangerouslySetInnerHTML={{ __html: selected.header || '' }}
                />
              )}
            </div>
            <div>
              <span style={{color: 'red'}}>*</span><Text strong>Body: </Text>
              {editField === 'body' ? (
                <div style={{ minWidth: 220 }}>
                  {ReactQuill ? (
                    <ReactQuill
                      value={editValue}
                      onChange={(val: string) => setEditValue(val)}
                      theme="snow"
                      style={{ minHeight: 120 }}
                    />
                  ) : (
                    <div>Loading editor...</div>
                  )}
                  <Button size="small" type="primary" style={{ marginTop: 8 }} onClick={() => saveEdit('body')}>Lưu</Button>
                  <Button size="small" style={{ marginLeft: 8 }} onClick={() => setEditField(null)}>Hủy</Button>
                </div>
              ) : (
                <div
                  style={{ border: '1px solid #eee', borderRadius: 4, padding: 8, background: '#fafafa', minHeight: 60, cursor: 'pointer' }}
                  onClick={() => startEdit('body', selected.body)}
                  dangerouslySetInnerHTML={{ __html: selected.body }}
                />
              )}
            </div>
            <div>
              <Text strong>Footer:</Text>
              {editField === 'footer' ? (
                <TextArea
                  value={editValue}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  autoFocus
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => saveEdit('footer')}
                  onPressEnter={e => { e.preventDefault(); saveEdit('footer'); }}
                  style={{ minWidth: 220 }}
                />
              ) : (
                <div
                  style={{ border: '1px solid #eee', borderRadius: 4, padding: 8, background: '#fafafa', minHeight: 30, cursor: 'pointer' }}
                  onClick={() => startEdit('footer', selected.footer || '')}
                  dangerouslySetInnerHTML={{ __html: selected.footer || '' }}
                />
              )}
            </div>
            <div>
              <Text strong>Created At:</Text> <span>{format(new Date(selected.createdAt), 'yyyy-MM-dd')}</span>
            </div>
            <div>
              <Text strong>Updated At:</Text> <span>{format(new Date(selected.updatedAt), 'yyyy-MM-dd')}</span>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default EmailTemplatePage;
