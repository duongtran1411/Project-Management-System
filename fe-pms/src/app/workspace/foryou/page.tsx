"use client";
import { Card, Tabs, Badge, List, Checkbox } from "antd";
import Link from "next/link";


const recentProjects = [
    {
        title: "Project Management",
        desc: "Team-managed software",
        badge: 4,
        color: "bg-blue-100",
        icon: "https://fpt-team-zwu4t30d.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10408?size=medium",
    },
    {
        title: "dsdfsd",
        desc: "Team-managed software",
        badge: 0,
        color: "bg-yellow-100",
        icon: "https://fpt-team-zwu4t30d.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10408?size=medium",
    },
    {
        title: "HE172042_TranDaiDuong_L...",
        desc: "Team-managed software",
        badge: 0,
        color: "bg-blue-100",
        icon: "https://fpt-team-zwu4t30d.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10408?size=medium",
    },
];

const assignedTasks = [
    {
        status: "IN PROGRESS",
        items: [
            {
                title: "Team member",
                code: "SCRUM-62",
                project: "Project Management",
                state: "In Progress",
            },
        ],
    },
    {
        status: "TO DO",
        items: [
            {
                title: "For you page",
                code: "SCRUM-73",
                project: "Project Management",
                state: "To Do",
            },
            {
                title: "List page",
                code: "SCRUM-71",
                project: "Project Management",
                state: "To Do",
            },
            {
                title: "List epic and task",
                code: "SCRUM-57",
                project: "Project Management",
                state: "To Do",
            },
        ],
    },
];

export default function Page() {
    return (
        <div className="min-h-screen p-8 bg-white">
            <h1 className="text-2xl font-semibold mb-7">For you</h1>
            <div className="w-full mb-4 border-b border-gray-200"></div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-medium">Recent projects</div>
                    <Link
                        href="/workspace/viewall"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View all projects
                    </Link>
                </div>

                <div className="flex gap-4 mb-6">
                    {recentProjects.map((proj, idx) => (
                        <Card
                            key={idx}
                            className="p-0 shadow-sm w-72"
                            styles={{ body: { padding: 0 } }}
                        >
                            <div className="flex">
                                <div className={`w-4 rounded-l ${proj.color}`}></div>
                                <div className="flex-1 ">
                                    <div className="flex items-center p-4 space-x-3">
                                        <img
                                            src={proj.icon}
                                            alt=""
                                            className="object-cover w-8 h-8 rounded"
                                        />
                                        <div className="flex flex-col">
                                            <div className="text-sm font-semibold leading-5">{proj.title}</div>
                                            <div className="text-xs text-gray-500">{proj.desc}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-4 mt-2 text-sm text-gray-600">
                                        <span>My open work items</span>
                                        {proj.badge > 0 && (
                                            <Badge count={proj.badge} color="#d1d5db" />
                                        )}
                                    </div>
                                    <div className="pl-4 mt-1 text-sm text-gray-600">Done work items</div>

                                    <Link
                                        href="/workspace/project-management"
                                        className="flex items-center justify-between block px-4 py-2 mt-4 text-xs text-gray-500 transition border-t border-gray-200 hover:bg-gray-100"
                                    >
                                        <span>Board</span>
                                        {/* <span className="text-base leading-none">&#9662;</span> */}
                                    </Link>

                                </div>
                            </div>
                        </Card>


                    ))}
                </div>
            </div>
            <Tabs
                defaultActiveKey="assigned"
                className="mb-4"
                items={[
                    { key: "worked", label: "Worked on" },
                    { key: "viewed", label: "Viewed" },
                    {
                        key: "assigned",
                        label: (
                            <span>
                                Assigned to me <Badge color="#d1d5db" count={4} className="ml-1" />
                            </span>
                        ),
                        children: (
                            <div>
                                {assignedTasks.map((section, idx) => (
                                    <div key={idx} className="mb-4">
                                        <div className="mb-2 text-xs font-semibold text-gray-500">
                                            {section.status}
                                        </div>
                                        <List
                                            dataSource={section.items}
                                            renderItem={(item) => (
                                                <List.Item className="flex items-center">
                                                    <Checkbox checked className="mr-2" />
                                                    <div>
                                                        <div className="font-medium">{item.title}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.code} · {item.project}
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto text-xs text-gray-400">
                                                        {item.state}
                                                    </div>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        ),
                    },
                    { key: "starred", label: "Starred" },
                    { key: "boards", label: "Boards" },
                ]}
            />
        </div>
    );
}
