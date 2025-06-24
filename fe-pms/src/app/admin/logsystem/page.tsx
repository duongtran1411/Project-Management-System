'use client'
import React from 'react';
import { Table, Tag } from 'antd';

interface UserLog {
  key: string;
  name: string;
  email: string;
  resetPasswordCount: number;
  changePasswordCount: number;
  loginCount: number;
  lastLogin: string;
}

const data: UserLog[] = [
  {
    key: '1',
    name: 'Nguyen Van A',
    email: 'vana@gmail.com',
    resetPasswordCount: 2,
    changePasswordCount: 1,
    loginCount: 10,
    lastLogin: '2024-06-01 09:30:00',
  },
  {
    key: '2',
    name: 'Tran Thi B',
    email: 'thib@gmail.com',
    resetPasswordCount: 0,
    changePasswordCount: 2,
    loginCount: 7,
    lastLogin: '2024-06-02 14:10:00',
  },
  {
    key: '3',
    name: 'Le Van C',
    email: 'vanc@gmail.com',
    resetPasswordCount: 1,
    changePasswordCount: 0,
    loginCount: 5,
    lastLogin: '2024-06-03 08:45:00',
  },
];

const columns = [
  {
    title: 'Tên User',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Gmail',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Reset Password',
    dataIndex: 'resetPasswordCount',
    key: 'resetPasswordCount',
    render: (count: number) => <Tag color={count > 0 ? 'orange' : 'default'}>{count}</Tag>,
  },
  {
    title: 'Change Password',
    dataIndex: 'changePasswordCount',
    key: 'changePasswordCount',
    render: (count: number) => <Tag color={count > 0 ? 'blue' : 'default'}>{count}</Tag>,
  },
  {
    title: 'Số lần đăng nhập',
    dataIndex: 'loginCount',
    key: 'loginCount',
    render: (count: number) => <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>,
  },
  {
    title: 'Lần đăng nhập cuối',
    dataIndex: 'lastLogin',
    key: 'lastLogin',
  },
];

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Log System</h1>
      <Table columns={columns} dataSource={data} bordered />
    </div>
  );
}