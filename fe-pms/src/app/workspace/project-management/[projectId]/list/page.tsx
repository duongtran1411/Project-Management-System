"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { getPeopleYouWorkWith } from "@/lib/services/peopleYouWork/peopleYouWork.service";
import {
    CalendarOutlined,
    CommentOutlined,
    DownOutlined,
    PlusOutlined,
    RightOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Input, Select, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
    axiosService.getAxiosInstance().get(url).then((res) => res.data);

const EpicPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [taskMap, setTaskMap] = useState<Record<string, any[]>>({});
    const [editingEpicId, setEditingEpicId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>("");
    const [editingStatusEpicId, setEditingStatusEpicId] = useState<string | null>(null);
    const [editingStatusValue, setEditingStatusValue] = useState<string>("");
    const [editingStatusTaskId, setEditingStatusTaskId] = useState<string | null>(null);
    const [editingStatusTaskValue, setEditingStatusTaskValue] = useState<string>("");
    const [editingTaskSummaryId, setEditingTaskSummaryId] = useState<string | null>(null);
    const [editingTaskSummaryText, setEditingTaskSummaryText] = useState<string>("");
    const [editingTaskPriorityId, setEditingTaskPriorityId] = useState<string | null>(null);
    const [editingTaskPriorityValue, setEditingTaskPriorityValue] = useState<string>("");
    const [people, setPeople] = useState([])


    const { data: epicData, mutate } = useSWR(
        projectId
            ? `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.GET_BY_PROJECT(projectId)}`
            : null,
        fetcher
    );

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

    const handleUpdateEpicSummary = async (epicId: string) => {
        try {
            await axiosService.getAxiosInstance().put(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.UPDATE_EPIC(epicId)}`,
                { name: editingText }
            );
            setTaskMap({});
            setExpandedKeys([]);
            await mutate();
        } catch (error) {
            console.error("Failed to update epic name:", error);
        } finally {
            setEditingEpicId(null);
            setEditingText("");
        }
    };


    const handleUpdateTaskSummary = async (taskId: string) => {
        try {
            await axiosService.getAxiosInstance().patch(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.UPDATE_NAME(taskId)}`,
                { name: editingTaskSummaryText }
            );
            await mutate();
        } catch (error) {
            console.error("Failed to update task summary:", error);
        } finally {
            setEditingTaskSummaryId(null);
            setEditingTaskSummaryText("");
        }
    };


    const handleUpdateEpicStatus = async (epicId: string) => {
        try {
            await axiosService.getAxiosInstance().put(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Epic.UPDATE_EPIC(epicId)}`,
                { status: editingStatusValue }
            );
            await mutate();
        } catch (error) {
            console.error("Failed to update epic status:", error);
        } finally {
            setEditingStatusEpicId(null);
            setEditingStatusValue("");
        }
    };


    const handleUpdateTaskStatus = async (taskId: string) => {
        try {
            await axiosService.getAxiosInstance().patch(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.UPDATE_STATUS(taskId)}`,
                { status: editingStatusTaskValue }
            );

            const epicId = Object.keys(taskMap).find((eid) =>
                taskMap[eid]?.some((task) => task._id === taskId)
            );

            if (epicId) {
                const taskRes = await fetcher(
                    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_EPIC(epicId)}`
                );
                setTaskMap((prev) => ({
                    ...prev,
                    [epicId]: taskRes.data,
                }));
            }
            await mutate();
        } catch (error) {
            console.error("Failed to update task status:", error);
        } finally {
            // Reset state
            setEditingStatusTaskId(null);
            setEditingStatusTaskValue("");
        }
    };


    const handleUpdateTaskPriority = async (taskId: string, newPriority: string) => {
        try {
            await axiosService.getAxiosInstance().patch(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.UPDATE_PRIORITY(taskId)}`,
                { priority: newPriority }
            );

            // Tìm lại epicId chứa task đó
            const epicId = Object.keys(taskMap).find((eid) =>
                taskMap[eid]?.some((task) => task._id === taskId)
            );

            if (epicId) {
                const taskRes = await fetcher(
                    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_EPIC(epicId)}`
                );
                setTaskMap((prev) => ({
                    ...prev,
                    [epicId]: taskRes.data,
                }));
            }

        } catch (error) {
            console.error("Failed to update task priority:", error);
        } finally {
            setEditingTaskPriorityId(null);
        }
    };

    const handleUpdateTaskAssignee = async (taskId: string, userId: string) => {
        try {
            await axiosService.getAxiosInstance().patch(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.UPDATE_ASSIGNEE(taskId)}`,
                { assigneeId: userId }
            );

            const epicId = Object.keys(taskMap).find((eid) =>
                taskMap[eid]?.some((task) => task._id === taskId)
            );

            if (epicId) {
                const taskRes = await fetcher(
                    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.GET_BY_EPIC(epicId)}`
                );
                setTaskMap((prev) => ({
                    ...prev,
                    [epicId]: taskRes.data,
                }));
            }
            await mutate();
        } catch (error) {
            console.error("Failed to update task assignee:", error);
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
        {
            title: "Summary",
            dataIndex: "summary",
            key: "summary",
            render: (text: string, record: any) => {
                if (record.isEpic) {
                    return editingEpicId === record.key ? (
                        <div style={{ width: "100%" }}>
                            <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onPressEnter={() => handleUpdateEpicSummary(record.key)}
                                onBlur={() => handleUpdateEpicSummary(record.key)}
                                autoFocus
                                size="small"
                                style={{ width: "100%" }}
                            />
                        </div>
                    ) : (
                        <span
                            onClick={() => {
                                setEditingEpicId(record.key);
                                setEditingText(text);
                            }}
                            style={{ cursor: "pointer", fontWeight: 500, display: "block" }}
                        >
                            {text}
                        </span>
                    );
                }
                // Task summary editing
                if (editingTaskSummaryId === record.key) {
                    return (
                        <Input
                            value={editingTaskSummaryText}
                            onChange={(e) => setEditingTaskSummaryText(e.target.value)}
                            onPressEnter={() => handleUpdateTaskSummary(record.key)}
                            onBlur={() => handleUpdateTaskSummary(record.key)}
                            autoFocus
                            size="small"
                            style={{ width: "100%" }}
                        />
                    );
                }
                return (
                    <span
                        onClick={() => {
                            setEditingTaskSummaryId(record.key);
                            setEditingTaskSummaryText(text);
                        }}
                        style={{ cursor: "pointer", display: "block" }}
                    >
                        {text}
                    </span>
                );
            },
            width: 200,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: any) => {
                const isEpic = record.isEpic;

                const isEditing = isEpic
                    ? editingStatusEpicId === record.key
                    : editingStatusTaskId === record.key;

                const editingValue = isEpic ? editingStatusValue : editingStatusTaskValue;

                const handleChange = (value: string) => {
                    if (isEpic) {
                        setEditingStatusValue(value);
                    } else {
                        setEditingStatusTaskValue(value);
                    }
                };

                const handleBlur = () => {
                    if (isEpic) {
                        handleUpdateEpicStatus(record.key);
                    } else {
                        handleUpdateTaskStatus(record.key);
                    }
                };

                const handleClick = () => {
                    if (isEpic) {
                        setEditingStatusEpicId(record.key);
                        setEditingStatusValue(status);
                    } else {
                        setEditingStatusTaskId(record.key);
                        setEditingStatusTaskValue(status);
                    }
                };

                return isEditing ? (
                    <Select
                        value={editingValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ width: 120 }}
                        autoFocus
                        size="small"
                        options={[
                            { value: "TO_DO", label: "TO DO" },
                            { value: "IN_PROGRESS", label: "IN PROGRESS" },
                            { value: "DONE", label: "DONE" },
                        ]}
                    />
                ) : (
                    <Tag
                        color={
                            status === "DONE" ? "green" : status === "IN_PROGRESS" ? "blue" : "default"
                        }
                        onClick={handleClick}
                        style={{ cursor: "pointer" }}
                    >
                        {status}
                    </Tag>
                );
            },
            width: 120,
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

                // Tìm người dùng trong danh sách hiện tại
                const currentUser = people.find((p) => p._id === assignee?._id);

                return (
                    <Select
                        showSearch
                        placeholder="Assign to..."
                        value={assignee?._id || "unassigned"}
                        onChange={(value) =>
                            handleUpdateTaskAssignee(record.key, value === "unassigned" ? null : value)
                        }
                        optionFilterProp="label"
                        size="small"
                        style={{ width: 220 }}
                        dropdownStyle={{ maxHeight: 300 }}
                        options={[
                            {
                                value: "unassigned",
                                label: (
                                    <span className="flex items-center gap-2">
                                        <Avatar icon={<UserOutlined />} size="small" />
                                        <span>Unassigned</span>
                                    </span>
                                ),
                            },
                            ...people.map((user: any) => ({
                                value: user._id,
                                label: (
                                    <span className="flex items-center gap-2">
                                        <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
                                        <span>{user.fullName}</span>
                                    </span>
                                ),
                            })),
                        ]}
                        // Hiển thị hiện tại
                        dropdownRender={(menu) => <>{menu}</>}
                        optionLabelProp="label"
                    />
                );
            },
        },

        {
            title: "Due date",
            dataIndex: "dueDate",
            key: "dueDate",
            width: 150,
            render: (date: string) => (
                <div className="flex items-center gap-2 px-2 py-1 text-gray-700 bg-white border rounded">
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
            render: (priority: string, record: any) => {
                if (record.isEpic) return priority;
                if (editingTaskPriorityId === record.key) {
                    return (
                        <Select
                            value={editingTaskPriorityValue}
                            onChange={(value) => setEditingTaskPriorityValue(value)}
                            onBlur={() => handleUpdateTaskPriority(record.key, editingTaskPriorityValue)}
                            autoFocus
                            size="small"
                            style={{ width: 100 }}
                            options={[
                                { value: "LOW", label: "LOW" },
                                { value: "MEDIUM", label: "MEDIUM" },
                                { value: "HIGH", label: "HIGH" },
                            ]}
                        />

                    );
                }
                return (
                    <span
                        onClick={() => {
                            setEditingTaskPriorityId(record.key);
                            setEditingTaskPriorityValue(priority);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        {priority}
                    </span>
                );
            },
        },
        {
            title: "Created",
            dataIndex: "created",
            key: "created",
            width: 150,
            render: (date: string) => (
                <div className="flex items-center gap-2 px-2 py-1 text-gray-700 bg-white border rounded">
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
                <div className="flex items-center gap-2 px-2 py-1 text-gray-700 bg-white border rounded">
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
        },
    ];

    useEffect(() => {
        const fetchPeople = async () => {
            if (!projectId) return;
            const res = await getPeopleYouWorkWith(projectId);
            if (res) setPeople(res);
        };
        fetchPeople();
    }, [projectId]);

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-7">
                <Input.Search placeholder="Search epic..." className="w-64" />
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
