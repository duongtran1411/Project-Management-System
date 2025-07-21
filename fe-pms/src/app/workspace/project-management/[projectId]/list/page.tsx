"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { getContributorsByProjectId } from "@/lib/services/projectContributor/projectContributor.service";
import {
    CalendarOutlined,
    CommentOutlined,
    DownOutlined,
    PlusOutlined,
    RightOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Input, Select, Table, Tag, DatePicker } from "antd";
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
    const [people, setPeople] = useState<Array<{ userId: { _id: string; fullName: string; avatar?: string } }>>([]);
    const [editingAssigneeTaskId, setEditingAssigneeTaskId] = useState<string | null>(null);
    const [editingAssigneeValue, setEditingAssigneeValue] = useState<string>("");
    const [editingReporterTaskId, setEditingReporterTaskId] = useState<string | null>(null);
    const [editingReporterValue, setEditingReporterValue] = useState<string>("");
    const [searchText, setSearchText] = useState("");



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


    const handleUpdateTaskSummary = async (taskId: string, newText: string) => {
        try {
            await axiosService.getAxiosInstance().patch(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.UPDATE_NAME(taskId)}`,
                { name: newText }
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
                { assignee: userId || null } // Gán null nếu không có user
            );

            // Cập nhật lại dữ liệu
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
        } catch (err) {
            console.error("Failed to update assignee:", err);
        } finally {
            setEditingAssigneeTaskId(null);
            setEditingAssigneeValue("");
        }
    };

    const handleUpdateTaskReporter = async (taskId: string, userId: string) => {
        try {
            await axiosService.getAxiosInstance().patch(
                `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Task.UPDATE_REPORTER(taskId)}`,
                { reporter: userId || null }
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
        } catch (err) {
            console.error("Failed to update reporter:", err);
        } finally {
            setEditingReporterTaskId(null);
            setEditingReporterValue("");
        }
    };




    const epicRows = (epicData?.data || []).filter((epic: any) =>
        epic.name.toLowerCase().includes(searchText.toLowerCase())
    ).map((epic: any) => ({
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
            const tasks = taskMap[epic.key]
                .filter((task) =>
                    task.name.toLowerCase().includes(searchText.toLowerCase())
                )
                .map((task) => ({
                    ...task,
                    key: task._id,
                    summary: task.name,
                    status: task.status,
                    assignee: task.assignee || "Unassigned",
                    dueDate: task.dueDate || "",
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
                            defaultValue={text}
                            onPressEnter={(e) => handleUpdateTaskSummary(record.key, e.currentTarget.value)}
                            onBlur={(e) => handleUpdateTaskSummary(record.key, e.currentTarget.value)}
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

        // {
        //     title: "Comments",
        //     key: "comments",
        //     render: () => (
        //         <span className="flex items-center gap-1 text-gray-500">
        //             <CommentOutlined /> Add comment
        //         </span>
        //     ),
        //     width: 150,
        // },


        {
            title: "Assignee",
            dataIndex: "assignee",
            key: "assignee",
            width: 280,
            render: (_: any, record: any) => {
                if (record.isEpic) return "";

                const assigneeId = typeof record.assignee === "object"
                    ? record.assignee?._id
                    : record.assignee;

                const assignee = people.find(p => p.userId._id === assigneeId);

                const name = assignee?.userId.fullName || "Unassigned";
                const avatar = assignee?.userId.avatar;

                if (editingAssigneeTaskId === record.key) {
                    return (
                        <Select
                            style={{ width: 250 }}
                            value={editingAssigneeValue}
                            onChange={(value) => {
                                setEditingAssigneeValue(value);
                                handleUpdateTaskAssignee(record.key, value);
                            }}
                            options={[
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <Avatar size="small">
                                                <UserOutlined />
                                            </Avatar>
                                            <span>Unassigned</span>
                                        </div>
                                    ),
                                    value: "", // Giá trị rỗng thể hiện unassigned
                                },
                                ...people.map((p) => ({
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <Avatar size="small" src={p.userId.avatar} />
                                            <span>{p.userId.fullName}</span>
                                        </div>
                                    ),
                                    value: p.userId._id,
                                })),
                            ]}
                            autoFocus
                            size="small"
                            optionLabelProp="label"
                        />

                    );
                }


                return (
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            setEditingAssigneeTaskId(record.key);
                            setEditingAssigneeValue(assigneeId || "");
                        }}
                    >
                        <Avatar size="small" src={avatar}>
                            {!avatar ? (name === "Unassigned" ? <UserOutlined /> : name.charAt(0)) : null}
                        </Avatar>

                        <span>{name}</span>
                    </div>
                );

            }


        },


        {
            title: "Due date",
            dataIndex: "dueDate",
            key: "dueDate",
            width: 150,
            render: (date: string) => (
                <div className="flex items-center gap-2 px-2 py-1 text-gray-700 bg-white border rounded">
                    <CalendarOutlined />
                    <span>{dayjs(date).format("DD/MM/YYYY")}</span>

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
                    <span>{dayjs(date).format("DD/MM/YYYY")}</span>

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
                    <span>{dayjs(date).format("DD/MM/YYYY")}</span>

                </div>
            ),
        },
        {
            title: "Reporter",
            dataIndex: "reporter",
            key: "reporter",
            width: 280,
            render: (_: any, record: any) => {
                if (record.isEpic) return "";

                const reporterId = typeof record.reporter === "object"
                    ? record.reporter?._id
                    : record.reporter;

                const reporter = people.find(p => p.userId._id === reporterId);

                const name = reporter?.userId.fullName || "Unassigned";
                const avatar = reporter?.userId.avatar;

                if (editingReporterTaskId === record.key) {
                    return (
                        <Select
                            style={{ width: 250 }}
                            value={editingReporterValue}
                            onChange={(value) => {
                                setEditingReporterValue(value);
                                handleUpdateTaskReporter(record.key, value);
                            }}
                            options={people.map((p) => ({
                                label: (
                                    <div className="flex items-center gap-2">
                                        <Avatar size="small" src={p.userId.avatar} />
                                        <span>{p.userId.fullName}</span>
                                    </div>
                                ),
                                value: p.userId._id,
                            }))}
                            autoFocus
                            size="small"
                            optionLabelProp="label"
                        />
                    );
                }

                return (
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            const validId = reporterId && people.some(p => p.userId._id === reporterId)
                                ? reporterId
                                : (people[0]?.userId._id || "");
                            setEditingReporterTaskId(record.key);
                            setEditingReporterValue(validId);
                        }}
                    >
                        <Avatar size="small" src={avatar}>
                            {!avatar ? (name === "Unassigned" ? <UserOutlined /> : name.charAt(0)) : null}
                        </Avatar>
                        <span>{name}</span>
                    </div>
                );
            }
        },

    ];

    useEffect(() => {
        const fetchPeople = async () => {
            if (!projectId) return;
            const res = await getContributorsByProjectId(projectId);
            if (res?.length) {
                setPeople(res);
            }
        };
        fetchPeople();
    }, [projectId]);


    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-7">
                <Input.Search
                    placeholder="Search epic..."
                    className="w-64"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                scroll={{ x: "max-content" }}
                rowKey="key"
            />

            {/* <div className="flex items-center mt-2">
                <Button type="dashed" icon={<PlusOutlined />} className="flex items-center justify-center w-full">
                    Create
                </Button>
            </div> */}
        </div>
    );
};

export default EpicPage;
