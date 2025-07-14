"use client";

import { Endpoints } from "@/lib/endpoints";
import { getAll, updateStatus } from "@/lib/services/user/user";
import { User } from "@/models/user/User";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import useSWR from "swr";
import { Spin } from "antd";
import { showErrorToast, showSuccessToast } from "@/components/common/toast/toast";
import { format } from "date-fns";
import Swal from "sweetalert2";
import Spinner from "@/components/common/spinner/spin";
const UserAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [users, setUsers] = useState<User[]>([]);
  const getAllUser = async (url: string): Promise<User[]> => {
    const response = await getAll(url);
    return response.data;
  };
  const { data, error, isLoading,mutate } = useSWR(
    `${Endpoints.User.GET_ALL}`,
    getAllUser
  );

  if (error) {
    showErrorToast(error.message);
  }

  useEffect(() => {
    if (data) {
      setUsers(data);
    }
  }, [data]);

  const filteredUsers = users
    ? users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmed) {
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    }
  };
  const confirmModal = (id: string, status: string) => {
    const newStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    Swal.fire({
      title: "CHANGE STATUS USER?",
      text: `You want change to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await updateStatus(id, newStatus);
          if(response.success){
            mutate()
            showSuccessToast(response.message)
          }
        } catch (error: any) {
          const errorMessage =
            error?.data?.response?.messsage ||
            error?.message ||
            "đã có lỗi xảy ra";
          if (errorMessage) {
            showErrorToast(errorMessage);
          }
        }
      }
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

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
              <FiSearch
                size={20}
                className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              />
              <input
                type="text"
                placeholder="Search users..."
                className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    No.
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Failed Login
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users &&
                  Array.isArray(users) &&
                  users.map((user, index) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            user.role.name === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                          {user.role.name}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-center">
                        <div className="flex justify-start space-x-3 items-center">
                          <p className="text-red-400">
                            number of times: {user.failedLoginAttempts}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                          onClick={() => confirmModal(user._id, user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-3 items-center">
                          {user.lastLogin
                            ? format(new Date(user.lastLogin), "dd/MM/yyyy")
                            : "Chưa đăng nhập"}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastUser, filteredUsers.length)}
              </span>{" "}
              of <span className="font-medium">{filteredUsers.length}</span>{" "}
              results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}>
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}>
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
