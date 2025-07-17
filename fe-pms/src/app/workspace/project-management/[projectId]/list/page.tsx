"use client";
import { CommentOutlined, FilterOutlined, GroupOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Table, Tag } from "antd";

const columns = [
    {
        title: "Type",
        dataIndex: "type",
        key: "type",
        render: () => (
            <span className="flex justify-center">
                <svg width="18" height="18" fill="none"><path d="M..." /></svg>
            </span>
        ),
        width: 80,
    },
    {
        title: "Key",
        dataIndex: "key",
        key: "key",
        width: 120,
    },
    {
        title: "Summary",
        dataIndex: "summary",
        key: "summary",
        width: 200,
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) => (
            <Tag color="default" className="font-bold">{status}</Tag>
        ),
        width: 100,
    },
    {
        title: "Comments",
        dataIndex: "comments",
        key: "comments",
        render: () => (
            <span className="flex items-center gap-1 text-gray-500">
                <CommentOutlined />
                Add comment
            </span>
        ),
        width: 150,
    },
    {
        title: "Assignee",
        dataIndex: "assignee",
        key: "assignee",
        width: 100,
    },
    {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        width: 100,
    },
    {
        title: "Created",
        dataIndex: "created",
        key: "created",
        width: 120,
    },
    {
        title: "Updated",
        dataIndex: "updated",
        key: "updated",
        width: 120,
    },
    {
        title: "Reporter",
        dataIndex: "reporter",
        key: "reporter",
        width: 120,
    },
];

const data = [
    { key: "1", type: "", key: "SCRUM-8", summary: "SRS Document", status: "TO DO" },
    { key: "2", type: "", key: "SCRUM-16", summary: "SDS Document", status: "TO DO" },
    { key: "3", type: "", key: "SCRUM-17", summary: "Project-Tracking", status: "TO DO" },
    { key: "4", type: "", key: "SCRUM-43", summary: "BACKEND-API", status: "TO DO" },
    { key: "5", type: "", key: "SCRUM-44", summary: "CLIENT", status: "TO DO" },
];

const avatars = [
    { name: "G", color: "red" },
    { name: "LV", color: "purple" },
    { name: "NS", color: "purple" },
    { name: "NH", color: "purple" },
    { name: "TD", color: "purple" },
];

const Page = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Input.Search
                    placeholder="Search list"
                    className="w-64"
                />
                <div className="flex items-center gap-2">
                    {avatars.map((a, idx) => (
                        <Avatar key={idx} style={{ backgroundColor: a.color, marginLeft: idx === 0 ? 0 : -10 }}>{a.name}</Avatar>
                    ))}
                    <Button icon={<FilterOutlined />} className="ml-4">Filter</Button>
                    <Button icon={<GroupOutlined />}>Group</Button>
                    <Button icon={<SettingOutlined />} />
                </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    bordered
                    className="mb-2 min-w-max"
                    scroll={{ x: "max-content" }}
                />
            </div>

            {/* Create Button */}
            <div className="flex items-center mt-2">
                <Button type="dashed" icon={<PlusOutlined />} className="flex items-center justify-center w-full">
                    Create
                </Button>
            </div>
        </div>
    );
};

export default Page;
