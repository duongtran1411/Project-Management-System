"use client";
import Spinner from "@/components/common/spinner/spin";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { addPermissionForRole } from "@/lib/services/role/role";
import { Permission, PermissionSelect } from "@/models/permission/Permission";
import { Role } from "@/models/role/Role";
import {
  InfoCircleOutlined,
  PlusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, CheckboxChangeEvent, List } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { mutate } from "swr";

export default function Page() {
  const [roles, setRoles] = useState<Role[]>();
  const [roleId, setRoleId] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission>();
  const [permissionChecked, setPermissionChecked] = useState<string[]>([]);
  const getRoles = async (url: string): Promise<Role[]> => {
    const response = await axiosService.getAxiosInstance().get(url);
    return response.data.data;
  };
  const {
    data: roleData,
    error: roleError,
    isLoading: isRoleLoading,
  } = useSWR(`${Endpoints.Role.GET_All}`, getRoles);

  useEffect(() => {
    if (roleData) {
      setRoles(roleData);
    }
  }, [roleData]);

  const handleRole = (id: string) => {
    setRoleId(id);
  };

  const getPermission = async (url: string): Promise<Permission> => {
    const response = await axiosService.getAxiosInstance().get(url);
    return response.data.data;
  };

  const {
    data,
    error,
    isLoading,
    mutate: permissionMutate,
  } = useSWR(
    roleId ? `${Endpoints.Role.GET_BY_ID(roleId)}` : "",
    getPermission
  );

  useEffect(() => {
    if (data) {
      setPermissions(data);
    }
  }, [data]);

  useEffect(() => {
    if (permissions) {
      setPermissionChecked(
        permissions.permissionSelect.permissionIds.map((p) => p._id)
      );
    }
  }, [permissions]);

  const selectPermission = (id: string, e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setPermissionChecked((prev) => [...prev, id]);
    } else {
      setPermissionChecked((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handlePermission = async () => {
    try {
      const token = localStorage.getItem(Constants.API_TOKEN_KEY);
      debugger;
      if (!token) {
        showErrorToast("Unauthorized");
      }
      const response = await addPermissionForRole(
        roleId,
        permissionChecked,
        token ? token : ""
      );
      console.log("response", response);
      if (response.success) {
        showSuccessToast(response.message);
        permissionMutate();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };

  if (roleError || error) {
    if (roleError) showErrorToast(roleError.message);
    if (error) showErrorToast(error.message);
  }

  if (isRoleLoading || isLoading) {
    return <Spinner />;
  }

  return (
    <div className="mx-2">
      <h2 className="text-3xl font-bold mb-3">
        Role <InfoCircleOutlined />
      </h2>
      <div className="flex flex-row">
        <List
          header={
            <div className="flex justify-between items-center">
              <p className="font-bold">ROLES</p>
              <Button className="bg-[#3849AB] text-zinc-50">
                New <PlusCircleOutlined />
              </Button>
            </div>
          }
          bordered
          dataSource={roles}
          renderItem={(item) => (
            <List.Item
              key={item._id}
              onClick={() => handleRole(item._id)}
              className={`cursor-pointer hover:!bg-gray-200 ${roleId === item._id ? "!bg-blue-200" : ""}`}>
              {item.name}
            </List.Item>
          )}
          className="bg-zinc-50 basis-1/3 mr-2"
        />
        {Array.isArray(permissions?.allPermission) &&
          permissions.allPermission && (
            <List
              header={
                <div className="flex justify-between items-center">
                  <p className="font-bold">PERMISSIONS</p>
                  <Button className="bg-[#3849AB] text-zinc-50">
                    New <PlusCircleOutlined />
                  </Button>
                </div>
              }
              footer={
                <div className="flex justify-end">
                  <Button
                    className="bg-[#3849AB] text-zinc-50"
                    onClick={() => handlePermission()}>
                    Save <SaveOutlined />
                  </Button>
                </div>
              }
              bordered
              dataSource={permissions.allPermission}
              renderItem={(item) => (
                <List.Item>
                  <div className="flex items-center gap-2 w-full">
                    <Checkbox
                      checked={permissionChecked.includes(item._id)}
                      onChange={(e) => selectPermission(item._id, e)}
                    />
                    <span>{item.code}</span>
                  </div>
                </List.Item>
              )}
              className="bg-zinc-50 basis-2/3"
            />
          )}
      </div>
    </div>
  );
}
