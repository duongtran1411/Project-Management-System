"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import {
    CalendarOutlined,
    CommentOutlined,
    DownOutlined,
    PlusOutlined,
    RightOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Input, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";


const fetcher = (url: string) =>
    axiosService.getAxiosInstance().get(url).then((res) => res.data);

const EpicPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

    const { data: epicData } = useSWR(
        projectId
            ? `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.GET_BY_PROJECT(projectId)}`
            : null,
        fetcher
    );

    const [taskMap, setTaskMap] = useState<Record<string, any[]>>({});

    // Bấm mở/đóng Epic
    const toggleExpand = async (epicId: string) => {
        const isExpanded = expandedKeys.includes(epicId);
        if (isExpanded) {
            setExpandedKeys(expandedKeys.filter((id) => id !== epicId));
        } else {
            if (!taskMap[epicId]) {
                const taskRes = await fetcher(
                    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_EPIC(epicId)}`
                );
                setTaskMap((prev) => ({ ...prev, [epicId]: taskRes.data }));
            }
            setExpandedKeys([...expandedKeys, epicId]);
        }
    };

    const epicRows = (epicData?.data || []).map((epic: any) => ({
        key: epic._id,
        summary: epic.name,
        status: epic.status,
        assignee: "Unassigned",
        priority: epic.priority,
        created: new Date(epic.createdAt).toLocaleDateString(),
        updated: new Date(epic.updatedAt).toLocaleDateString(),
        reporter: epic.reporter,
        isEpic: true,
    }));

    const dataSource = epicRows.flatMap((epic) => {
        const rows = [epic];
        if (expandedKeys.includes(epic.key) && taskMap[epic.key]) {
            const tasks = taskMap[epic.key].map((task) => ({
                ...task,
                key: task._id,
                summary: task.name,
                status: task.status,
                assignee: task.assignee || "Unassigned",
                dueDate: new Date(task.createdAt).toLocaleDateString(),
                priority: task.priority || "None",
                created: new Date(task.createdAt).toLocaleDateString(),
                updated: new Date(task.updatedAt).toLocaleDateString(),
                reporter: task.reporter || "N/A",
                isEpic: false,
            }));
            rows.push(...tasks);
        }
        return rows;
    });

    const columns = [
        {
            title: "Type",
            key: "type",
            render: (_: any, record: any) => (
                <span className="flex items-center">
                    {record.isEpic ? (
                        <span
                            onClick={() => toggleExpand(record.key)}
                            style={{ cursor: "pointer", marginRight: 8 }}
                        >
                            {expandedKeys.includes(record.key) ? <DownOutlined /> : <RightOutlined />}
                        </span>
                    ) : (
                        <span style={{ marginLeft: 24 }} />
                    )}
                    <svg width="18" height="18" fill="none">
                        <path d="M..." />
                    </svg>
                </span>
            ),
            width: 80,
        },
        // {
        //     title: "Key",
        //     dataIndex: "key",
        //     key: "key",
        //     render: (text: string, record: any) => (
        //         <span style={{ marginLeft: record.isEpic ? 0 : 0 }}>{text}</span>
        //     ),
        //     width: 120,
        // },
        {
            title: "Summary",
            dataIndex: "summary",
            key: "summary",
            render: (text: string, record: any) => (
                <span style={{ marginLeft: record.isEpic ? 0 : 0 }}>{text}</span>
            ),
            width: 200,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "DONE" ? "green" : status === "IN_PROGRESS" ? "blue" : "default"}>
                    {status}
                </Tag>
            ),
            width: 100,
        },
        {
            title: "Comments",
            key: "comments",
            render: () => (
                <span className="flex items-center gap-1 text-gray-500">
                    <CommentOutlined /> Add comment
                </span>
            ),
            width: 150,
        },
        {
            title: "Assignee",
            dataIndex: "assignee",
            key: "assignee",
            width: 280,
            render: (assignee: any, record: any) => {
                if (record.isEpic) return null;
                if (!assignee || !assignee.fullName) {
                    return (
                        <span className="flex items-center gap-2 text-gray-500">
                            <Avatar icon={<UserOutlined />} />
                            <span>Unassigned</span>
                        </span>
                    );
                }

                return (
                    <span className="flex items-center gap-2">
                        <Avatar src={assignee.avatar} />
                        <span>{assignee.fullName}</span>
                    </span>
                );
            },
        },

        {
            title: "Due date",
            dataIndex: "dueDate",
            key: "dueDate",
            width: 150,
            render: (date: string) => (
                <div
                    className="flex items-center gap-2 px-2 py-1 text-gray-700 bg-white border rounded"
                    style={{ width: "fit-content" }}
                >
                    <CalendarOutlined />
                    <span>{dayjs(date).format("MMM D, YYYY")}</span>
                </div>
            ),
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
            width: 150,
            render: (date: string) => (
                <div
                    className="flex items-center gap-2 px-2 py-1 text-gray-700 bg-white border rounded"
                    style={{ width: "fit-content" }}
                >
                    <CalendarOutlined />
                    <span>{dayjs(date).format("MMM D, YYYY")}</span>
                </div>
            ),
        },
        {
            title: "Updated",
            dataIndex: "updated",
            key: "updated",
            width: 150,
            render: (date: string) => (
                <div
                    className="flex items-center gap-2 px-2 py-1 text-gray-700 bg-white border rounded"
                    style={{ width: "fit-content" }}
                >
                    <CalendarOutlined />
                    <span>{dayjs(date).format("MMM D, YYYY")}</span>
                </div>
            ),
        },
        {
            title: "Reporter",
            dataIndex: "reporter",
            key: "reporter",
            width: 280,
            render: (reporter: any, record: any) => {
                if (record.isEpic) return null;

                if (!reporter || !reporter.fullName) {
                    return (
                        <span className="flex items-center gap-2 text-gray-500">
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#e0e0e0" }} />
                            <span>Unassigned</span>
                        </span>
                    );
                }

                return (
                    <span className="flex items-center gap-2">
                        <Avatar src={reporter.avatar} size={24} />
                        <span>{reporter.fullName}</span>
                    </span>
                );
            },
        }
    ];



    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-7">
                <Input.Search placeholder="Search epic..." className="w-64" />
                {/* <div className="flex items-center gap-2">          
                    <Button icon={<FilterOutlined />} className="ml-4">Filter</Button>
                    <Button icon={<GroupOutlined />}>Group</Button>
                    <Button icon={<SettingOutlined />} />
                </div> */}
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                scroll={{ x: "max-content" }}
                rowKey="key"
            />

            <div className="flex items-center mt-2">
                <Button type="dashed" icon={<PlusOutlined />} className="flex items-center justify-center w-full">
                    Create
                </Button>
            </div>
        </div>
    );
};

export default EpicPage;
