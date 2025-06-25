import React from "react";

const stats = [
    {
        label: "Total Workspace",
        value: "3.5K",
        icon: (
            <span className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7.305 4.5 3.135 7.305 1.5 12c1.635 4.695 5.805 7.5 10.5 7.5s8.865-2.805 10.5-7.5C20.865 7.305 16.695 4.5 12 4.5z" /><circle cx="12" cy="12" r="3" /></svg>
            </span>
        ),
        change: "+0.43%",
        changeType: "up",
        color: "text-green-500"
    },
    {
        label: "Total Project",
        value: "$4.2K",
        icon: (
            <span className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
            </span>
        ),
        change: "+4.35%",
        changeType: "up",
        color: "text-green-500"
    },
    {
        label: "Total Task",
        value: "3.5K",
        icon: (
            <span className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
            </span>
        ),
        change: "+2.59%",
        changeType: "up",
        color: "text-green-500"
    },
    {
        label: "Total Users",
        value: "3.5K",
        icon: (
            <span className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 014-4h0a4 4 0 014 4v2" /></svg>
            </span>
        ),
        change: "-0.95%",
        changeType: "down",
        color: "text-red-500"
    }
];

const Dashboard = () => {
    return (
        <div className="bg-[#F3F4F6]">
            <div className="grid grid-cols-1 gap-6 px-10 mb-8 md:grid-cols-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-6 bg-white shadow rounded-xl">
                        <div className="flex items-center gap-3">
                            {stat.icon}
                            <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-gray-500">{stat.label}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold">
                            <span className={stat.changeType === "up" ? "text-green-500" : "text-red-500"}>
                                {stat.change}
                            </span>
                            <span className={
                                "inline-flex items-center justify-center w-5 h-5 rounded-full " +
                                (stat.changeType === "up" ? "bg-green-100" : "bg-red-100")
                            }>
                                {stat.changeType === "up" ? (
                                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 px-10 pb-10 md:grid-cols-2">
                <div className="p-6 bg-white shadow rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Payments Overview</h2>
                        <select className="px-2 py-1 text-sm border rounded">
                            <option>Monthly</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    {/* Replace with chart component */}
                    <div className="flex items-center justify-center h-48 text-gray-400">[Line Chart Here]</div>
                    <div className="flex justify-between mt-4">
                        <div>
                            <div className="text-xs text-gray-500">Received Amount</div>
                            <div className="text-lg font-bold">$580.00</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Due Amount</div>
                            <div className="text-lg font-bold">$628.00</div>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white shadow rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Profit this week</h2>
                        <select className="px-2 py-1 text-sm border rounded">
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>
                    {/* Replace with chart component */}
                    <div className="flex items-center justify-center h-48 text-gray-400">[Bar Chart Here]</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
