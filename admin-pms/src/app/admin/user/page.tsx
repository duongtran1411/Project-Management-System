"use client";

import { Endpoints } from "@/lib/endpoints";
import { getAll, updateStatus } from "@/lib/services/user/user";
import { User } from "@/models/user/User";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button, Input,Table, Tag } from "antd";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { format, parseISO } from "date-fns";
import Swal from "sweetalert2";
import Spinner from "@/components/common/spinner/spin";
import { createStyles } from "@/components/common/antd/createStyle";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Pagination as Paging } from "@/models/pagination/Pagination";
import { Filter } from "@/models/filter/Filter";
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css({
      [`${antCls}-table`]: {
        [`${antCls}-table-container`]: {
          [`${antCls}-table-body`]: {
            scrollbarWidth: "thin",
            scrollbarColor: "#eaeaea transparent",
          },
        },
      },
    }),
  };
});

const UserAdmin = () => {
  const { customTable } = useStyle;
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Paging>({
    limit: 10,
    page: 1,
    totalPages: 4,
  });
  const [filter, setFilter] = useState<Filter>();
  const [users, setUsers] = useState<User[]>([]);
  const getAllUser = async (url: string): Promise<User[]> => {
    const response = await getAll(url);
    return response.data;
  };

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      limit: pagination.limit.toString(),
      page: pagination.page.toString(),
    });
    
    return params.toString();
  }, [pagination, filter]);

  const filteredUsers = useMemo(() => {
  if (!searchTerm) return users;
  return users.filter((u) =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [users, searchTerm]);

  const { data, error, isLoading, mutate } = useSWR(
    `${Endpoints.User.GET_ALL}?${queryString}`,
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

  const handlePageSize = (pagination: TablePaginationConfig) => {
    const newPage = pagination.current;
    const newLimit = pagination.pageSize;
    if (newPage && newLimit) {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
        limit: newLimit,
      }));
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
          if (response.success) {
            mutate();
            showSuccessToast(response.message);
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

  const columns: ColumnsType<User> = [
    {
      title: "No.",
      width: 50,
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      fixed: "left",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      fixed: "left",
      render: (fullName: string) => fullName || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => email || "-",
    },
    {
      title: "Role",
      key: "role",
      dataIndex: "role",
      width: 150,
      align: "center",
      render: (role: { name: string }) => {
        const name = role?.name?.toUpperCase() || "UNKNOWN";
        let color = "default";
        if (name === "ADMIN") color = "purple";
        else if (name === "USER") color = "green";
        else if (name === "STAKEHOLDER") color = "orange";

        return <Tag color={color}>{name}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: string,record:User) => {
        const s = status?.toUpperCase() || "UNKNOWN";
        const color =
          s === "ACTIVE" ? "green" : s === "INACTIVE" ? "red" : "default";
        return (
          <Tag className="hover:cursor-pointer" color={color} onClick={() => confirmModal(record._id, s)}>
            {s}
          </Tag>
        );
      },
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 180,
      render: (date: string) =>
        date ? format(parseISO(date), "dd/MM/yyyy HH:mm") : "-",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) =>
        date ? format(parseISO(date), "dd/MM/yyyy HH:mm") : "-",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" type="link">
            Edit
          </Button>
          <Button size="small" danger type="link">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex justify-center items-center w-50">
      <div className="bg-zinc-50">
        <h2 className="mb-2 text-center text-blue-500 font-bold text-xl">
          USER
        </h2>
        <Input
          placeholder="Search by action"
          allowClear
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
          }}
          className="mt-2 w-[250px] mx-5"
        />
        <Table
          size="small"
          rowKey={(record) => record._id}
          className={customTable}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            pageSizeOptions: ["10", "15", "20"],
            defaultPageSize: pagination.limit,
          }}
          style={{ padding: 30 }}
          columns={columns}
          dataSource={filteredUsers}
          scroll={{ x: "1500px" }}
          onChange={handlePageSize}
        />
      </div>
    </div>
  );
};

export default UserAdmin;
