"use client";

import React, { useEffect, useState } from "react";
import { Table, Input, Button, Select, Tag, Spin, Avatar } from "antd";
import { SearchOutlined, FilterOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { getMyTasks } from "@/lib/services/task/task.service";
import { getProjectsContributorByUserId } from "@/lib/services/projectContributor/projectContributor.service";
import { getTasksByProject } from "@/lib/services/task/task.service";
import { useAuth } from "@/lib/auth/auth-context";

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
        render: (_: any, record: any) => {
            const name = record.assigneeName || "Unassigned";
            const avatar = record.assigneeAvatar || undefined;
            return (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar size={24} src={avatar} style={{ background: !avatar ? '#ccc' : undefined }}>
                        <UserOutlined />
                    </Avatar>
                    {name}
                </span>
            );
        },
    },
    {
        title: "Reporter",
        dataIndex: "reporter",
        key: "reporter",
        render: (_: any, record: any) => {
            const name = record.reporterName || "Unassigned";
            const avatar = record.reporterAvatar || undefined;
            return (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar size={24} src={avatar} style={{ background: !avatar ? '#ccc' : undefined }}>
                        <UserOutlined />
                    </Avatar>
                    {name}
                </span>
            );
        },
    },
    {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        render: (priority: string) => {
            let color = "default";

            switch (priority?.toLowerCase()) {
                case "high":
                    color = "red";
                    break;
                case "medium":
                    color = "orange";
                    break;
                case "low":
                    color = "green";
                    break;
                case "urgent":
                    color = "volcano";
                    break;
                default:
                    color = "default";
                    break;
            }

            return <Tag color={color}>{priority || "Unspecified"}</Tag>;
        },
    },

    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
            if (status === "DONE") {
                return <Tag color="green">DONE</Tag>;
            } else if (status === "IN_PROGRESS") {
                return <Tag color="blue">IN PROGRESS</Tag>;
            } else if (status === "TO_DO") {
                return <Tag color="default">TO DO</Tag>;
            } else {
                return <Tag color="default">{status || "Unspecified"}</Tag>;
            }
        },
    },

    {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) => (
            date ? (
                <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "2px 10px",
                    background: "#f9fafb"
                }}>
                    <CalendarOutlined style={{ color: "#555" }} />
                    {date}
                </span>
            ) : (
                <span>None</span>
            )
        ),
    },
    {
        title: "Updated",
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (date: string) => (
            date ? (
                <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "2px 10px",
                    background: "#f9fafb"
                }}>
                    <CalendarOutlined style={{ color: "#555" }} />
                    {date}
                </span>
            ) : (
                <span>None</span>
            )
        ),
    },
    {
        title: "Due Date",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (date: string) => (
            date ? (
                <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "2px 10px",
                    background: "#f9fafb"
                }}>
                    <CalendarOutlined style={{ color: "#555" }} />
                    {date}
                </span>
            ) : (
                <span>None</span>
            )
        ),
    },
];

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format: dd/MM/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const Page = () => {
    const { userInfo } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);



    useEffect(() => {
        const fetchProjects = async () => {
            if (!userInfo?.userId) return;
            const projects = await getProjectsContributorByUserId(userInfo.userId);
            setProjects(projects || []);
        };
        fetchProjects();
    }, [userInfo]);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            let tasks = [];

            if (selectedProject && selectedProject.length > 0) {
                // Gộp tasks từ nhiều project
                const allTasks = await Promise.all(
                    selectedProject.map((projId) => getTasksByProject(projId))
                );
                tasks = allTasks.flat();
            } else {
                tasks = await getMyTasks() || [];
            }

            if (tasks) {
                setData(
                    tasks.map((task: any, idx: number) => ({
                        key: task._id || idx,
                        work: task.name || "",
                        assigneeName: task.assignee?.fullName || "Unassigned",
                        assigneeAvatar: task.assignee?.avatar || undefined,
                        reporterName: task.reporter?.fullName || "Unassigned",
                        reporterAvatar: task.reporter?.avatar || undefined,
                        priority: task.priority || "",
                        status: task.status || "",
                        createdAt: formatDate(task.createdAt),
                        updatedAt: formatDate(task.updatedAt),
                        dueDate: formatDate(task.dueDate),
                    }))
                );
            }

            setLoading(false);
        };

        fetchTasks();
    }, [selectedProject]);

    useEffect(() => {
        let filtered = [...data];

        if (searchText) {
            filtered = filtered.filter(item =>
                item.work.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (selectedStatus.length > 0) {
            filtered = filtered.filter(item => selectedStatus.includes(item.status));
        }


        setFilteredData(filtered);
    }, [searchText, selectedStatus, data]);


    return (
        <div className="min-h-screen p-8 bg-white ">
            <h1 className="mb-6 text-2xl font-bold">All work</h1>
            <div className="flex flex-wrap gap-2 mb-10">
                <Input
                    placeholder="Search work"
                    prefix={<SearchOutlined />}
                    className="w-52"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
                <Select
                    mode="multiple"
                    placeholder="Select project(s)"
                    className="w-60"
                    value={selectedProject}
                    onChange={(value) => setSelectedProject(value)}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    optionLabelProp="label"
                >
                    {projects.map((project: any) => {
                        const iconSrc = project.icon || "/project.png";
                        return (
                            <Option
                                key={project._id}
                                value={project._id}
                                label={
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Avatar size="small" src={iconSrc} />
                                        {project.name}
                                    </span>
                                }
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Avatar size="small" src={iconSrc} />
                                    {project.name}
                                </span>
                            </Option>
                        );
                    })}
                </Select>
                {/* <Select defaultValue="Assignee" className="w-32">
                    <Option value="Assignee">Assignee</Option>
                </Select> */}
                <Select
                    mode="multiple"
                    placeholder="Select status"
                    className="w-36"
                    value={selectedStatus}
                    onChange={(value) => setSelectedStatus(value)}
                    allowClear
                >
                    <Option value="TO_DO">
                        <Tag color="default">TO DO</Tag>
                    </Option>
                    <Option value="IN_PROGRESS">
                        <Tag color="blue">IN PROGRESS</Tag>
                    </Option>
                    <Option value="DONE">
                        <Tag color="green">DONE</Tag>
                    </Option>
                </Select>


                {/* <Button icon={<FilterOutlined />} className="!rounded">
                    More filters
                </Button> */}
                <Button
                    type="text"
                    className="font-semibold text-gray-600"
                    onClick={() => {
                        setSelectedProject([]);
                        setSearchText("");
                        setSelectedStatus([]);
                    }}
                >
                    Clear filters
                </Button>



            </div>
            <Spin spinning={loading} tip="Loading...">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    pagination={false}
                    className="rounded shadow"
                    scroll={{ x: 1500 }} // tăng giá trị nếu cần
                    bordered
                />
            </Spin>
            <div className="mt-2 text-right text-gray-500">{data.length} of {data.length}</div>
        </div>
    );
};

export default Page;