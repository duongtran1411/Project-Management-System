"use client";

import React from "react";
import { Table, Input, Button, Select, Tag } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const { Option } = Select;

const columns = [
    {
        title: "Work",
        dataIndex: "work",
        key: "work",
        render: (text: string) => <a className="text-blue-600">{text}</a>,
    },
    {
        title: "Assignee",
        dataIndex: "assignee",
        key: "assignee",
    },
    {
        title: "Reporter",
        dataIndex: "reporter",
        key: "reporter",
    },
    {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        render: (priority: string) => (
            <span>
                <Tag color={priority === "High" ? "red" : "orange"}>{priority}</Tag>
            </span>
        ),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) =>
            status === "DONE" ? (
                <Tag color="green">DONE</Tag>
            ) : (
                <Tag color="default">TO DO</Tag>
            ),
    },
    {
        title: "Resolution",
        dataIndex: "resolution",
        key: "resolution",
    },
];

const data = [
    {
        key: "1",
        work: "LAB8-1",
        assignee: "Giang",
        reporter: "Giang",
        priority: "Medium",
        status: "TO DO",
        resolution: "Unresolved",
    },
    {
        key: "2",
        work: "SCRUM-77",
        assignee: "Tran Dai Duong",
        reporter: "Tran Dai Duong",
        priority: "Medium",
        status: "TO DO",
        resolution: "Unresolved",
    },
    // ... Thêm các dòng dữ liệu khác tương tự
];

const Page = () => {
    return (
        <div className="min-h-screen p-8 bg-white">
            <h1 className="mb-6 text-2xl font-bold">All work</h1>
            <div className="flex flex-wrap gap-2 mb-4">
                <Button type="default" className="!rounded">Basic</Button>
                <Button type="default" className="!rounded">JQL</Button>
                <Input
                    placeholder="Search work"
                    prefix={<SearchOutlined />}
                    className="w-64"
                />
                <Select defaultValue="Project" className="w-32">
                    <Option value="Project">Project</Option>
                </Select>
                <Select defaultValue="Assignee" className="w-32">
                    <Option value="Assignee">Assignee</Option>
                </Select>
                <Select defaultValue="Type" className="w-32">
                    <Option value="Type">Type</Option>
                </Select>
                <Select defaultValue="Status" className="w-32">
                    <Option value="Status">Status</Option>
                </Select>
                <Button icon={<FilterOutlined />} className="!rounded">
                    More filters
                </Button>
                <a className="ml-2 text-blue-600 cursor-pointer">Save filter</a>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                className="rounded shadow"
                scroll={{ x: true }}
            />
            <div className="mt-2 text-right text-gray-500">73 of 73</div>
        </div>
    );
};

export default Page;