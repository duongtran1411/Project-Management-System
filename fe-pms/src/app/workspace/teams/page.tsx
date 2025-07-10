"use client";
import { SearchOutlined, StarFilled, TeamOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Input, Modal } from "antd";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

const people = [
    {
        name: "Tran Dai Duong",
        initials: "TD",
        color: "bg-purple-600",
    },
    {
        name: "Nguyen Van A",
        initials: "NA",
        color: "bg-blue-600",
    },
    {
        name: "Le Thi B",
        initials: "LB",
        color: "bg-pink-500",
    },
];

const teams = [
    {
        name: "Frontend Team",
        members: 5,
        color: "bg-green-500",
        icon: <TeamOutlined className="text-xl text-white" />,
    },
    {
        name: "Backend Team",
        members: 4,
        color: "bg-yellow-500",
        icon: <TeamOutlined className="text-xl text-white" />,
    },
    {
        name: "QA Team",
        members: 3,
        color: "bg-red-500",
        icon: <TeamOutlined className="text-xl text-white" />,
    },
];

const Page = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full p-8 bg-white">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Teams</h1>
                <div className="space-x-2">
                    <Button>Create team</Button>
                    <Button type="primary" onClick={showModal}>Add people</Button>
                </div>
            </header>
            <div className="mb-14">
                <Input
                    size="large"
                    placeholder="Search teams"
                    prefix={<SearchOutlined className="text-gray-400" />}
                    className="w-full "
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <section>
                <h2 className="mb-4 font-semibold text-l">People you work with</h2>
                <div className="flex flex-wrap gap-4">
                    {people.map((person, idx) => (
                        <div
                            key={idx}
                            className="text-center p-4 border rounded-lg shadow-sm hover:shadow-md cursor-pointer bg-white min-w-[180px]  h-[210px] flex flex-col items-center"
                        >
                            <Avatar
                                size={128}
                                className={`${person.color} mb-2 flex items-center justify-center`}
                                style={{ fontSize: 48, fontWeight: 600 }}
                            >
                                {person.initials}
                            </Avatar>
                            <p className="font-semibold">{person.name}</p>
                        </div>

                    ))}
                </div>
            </section>
            <section className="mt-8">
                <h2 className="mb-4 text-lg font-semibold">Teams</h2>
                <div className="flex flex-wrap gap-6">
                    {filteredTeams.length > 0 ? (
                        filteredTeams.map((team, idx) => (
                            <Card
                                key={idx}
                                className="w-64 transition-all shadow hover:shadow-lg "
                                bodyStyle={{ padding: 20 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar size={48} className={`${team.color} flex items-center justify-center`}>{team.icon}</Avatar>
                                    <div>
                                        <div className="text-lg font-bold">{team.name}</div>
                                        <div className="text-sm text-gray-500">{team.members} members</div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="mt-4 text-gray-500">No teams found.</div>
                    )}
                </div>
                {/* Placeholder graphic giữ lại phía dưới nếu chưa có team */}
                {filteredTeams.length === 0 && (
                    <div className="mt-10 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                            <div className="relative">
                                <div
                                    className="bg-yellow-400"
                                    style={{
                                        width: "60px",
                                        height: "40px",
                                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                                    }}
                                ></div>
                                <div
                                    className="bg-blue-500"
                                    style={{
                                        position: "absolute",
                                        top: "0",
                                        left: "25px",
                                        width: "10px",
                                        height: "60px",
                                    }}
                                ></div>
                                <StarFilled
                                    className="text-yellow-400"
                                    style={{
                                        fontSize: "24px",
                                        position: "absolute",
                                        top: "15px",
                                        left: "18px",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>
            <Modal
                title={<span className="text-xl font-bold">Add people to Jira</span>}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleCancel}>
                        Add
                    </Button>,
                ]}
                width={600}
            >
                <div className="py-4">
                    <label className="font-semibold" htmlFor="names-emails">Names or emails <span className="text-red-500">*</span></label>
                    <Input id="names-emails" placeholder="e.g., Maria, maria@company.com" className="mt-1" />

                    <div className="my-4 text-sm text-gray-500">or add from</div>

                    <div className="space-y-2">
                        <Button icon={<FaGoogle />} block className="flex items-center justify-center !h-auto py-2">
                            <span className="ml-2 font-semibold">Google</span>
                        </Button>

                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                        This site is protected by reCAPTCHA and the Google{' '}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                            Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                            Terms of Service
                        </a>{' '}
                        apply.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Page;
