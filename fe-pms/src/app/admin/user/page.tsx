"use client";

import { useState } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const UserAdmin = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;

    // Mock data - replace with actual data from your API
    const users = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive" },
        { id: 4, name: "Alice Brown", email: "alice@example.com", role: "User", status: "Active" },
        { id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "User", status: "Inactive" },
        { id: 6, name: "Diana Miller", email: "diana@example.com", role: "User", status: "Active" },
        { id: 7, name: "Edward Davis", email: "edward@example.com", role: "User", status: "Active" },
        { id: 8, name: "Fiona Clark", email: "fiona@example.com", role: "User", status: "Inactive" },
    ];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="flex h-screen bg-gray-100">

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-600">Manage your system users</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <div className="relative">
                            <FiSearch size={20} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                            <FiPlus size={20} className="mr-2" />
                            Add User
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex space-x-3">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <FiEdit2 size={20} />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <FiTrash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                            <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
                            <span className="font-medium">{filteredUsers.length}</span> results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAdmin;
