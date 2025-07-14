"use client";
import Spinner from "@/components/common/spinner/spin";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import {
  addPermission,
  getPermissionById,
  updatePermission,
} from "@/lib/services/permission/permission";
import { addPermissionForRole, addRole } from "@/lib/services/role/role";
import {
  Permission,
  PermissionDetail,
  PermissionSelect,
} from "@/models/permission/Permission";
import { Role } from "@/models/role/Role";
import {
  EditOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  CheckboxChangeEvent,
  Form,
  Input,
  List,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { mutate } from "swr";
const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};
export default function Page() {
  const [roles, setRoles] = useState<Role[]>();
  const [roleId, setRoleId] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission>();
  const [permissionChecked, setPermissionChecked] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPerOpen, setIsModalPerOpen] = useState(false);
  const [roleName, setRoleName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState<boolean>(false);
  const [permisDetail, setPermisDetail] = useState<PermissionDetail>();
  const [selectedPermisId, setSelectedPermisId] = useState<string | null>(null);

  const getRoles = async (url: string): Promise<Role[]> => {
    const response = await axiosService.getAxiosInstance().get(url);
    return response.data.data;
  };
  const {
    data: roleData,
    error: roleError,
    isLoading: isRoleLoading,
    mutate: roleMutate,
  } = useSWR(`${Endpoints.Role.GET_All}`, getRoles);

  useEffect(() => {
    if (roleData) {
      setRoles(roleData);
      setRoleId(roleData[0]._id);
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

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    form.submit();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [form] = Form.useForm();
  const [formPer] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const onFinish = async () => {
    try {
      const token = localStorage.getItem(Constants.API_TOKEN_KEY);
      debugger;
      if (!token) {
        showErrorToast("Unauthorized");
      }
      const role = roleName.toUpperCase();
      const response = await addRole(role, description);
      if (response.success) {
        form.resetFields();
        setIsModalOpen(false);
        showSuccessToast(response.message);
        roleMutate();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };

  const showModalPer = () => {
    setIsModalPerOpen(true);
  };

  const handleSubmit = () => {
    formPer.submit();
  };

  const handleCancelPer = () => {
    setIsModalPerOpen(false);
  };

  const onSubmitPer = async () => {
    try {
      const code = formPer.getFieldValue("code");
      const description = formPer.getFieldValue("description_permission");
      const response = await addPermission(
        code,
        description
      );
      if (response.success) {
        formPer.resetFields();
        setIsModalPerOpen(false);
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

  const showModalUpdate = async (id: string) => {
    setIsModalUpdateOpen(true);
    setSelectedPermisId(id);
    await getPermisById(selectedPermisId ?selectedPermisId: '' )
  };

  useEffect(() => {
    if (selectedPermisId) {
      getPermisById(selectedPermisId);
    }
  }, [selectedPermisId]);

  useEffect(() => {
    if (permisDetail) {
      formUpdate.setFieldsValue({
        code_update: permisDetail.code,
        description_update: permisDetail.description,
      });
    }
  }, [permisDetail]);

  const handleCancelUpdate = () => {
    setIsModalUpdateOpen(false);
  };

  const handleUpdateSubmit = () => {
    formUpdate.submit();
  };

  const onUpdateSubmit = async () => {
    try {
      const code = formUpdate.getFieldValue("code_update");
      const description = formUpdate.getFieldValue("description_update");
      const response = await updatePermission(
        selectedPermisId ? selectedPermisId : "",
        code,
        description
      );
      if (response.success) {
        formUpdate.resetFields();
        setIsModalUpdateOpen(false);
        showSuccessToast(response.message);
        
        permissionMutate()
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };
  const getPermisById = async (id: string) => {
    try {
      const response = await getPermissionById(id);
      if (response.success) {
        setPermisDetail(response.data);
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
              <Button className="bg-[#3849AB] text-zinc-50" onClick={showModal}>
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
              className={`cursor-pointer hover:!bg-gray-200 ${
                roleId === item._id ? "!bg-blue-200" : ""
              }`}>
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
                  <Button
                    className="bg-[#3849AB] text-zinc-50"
                    onClick={showModalPer}>
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
                    <EditOutlined onClick={() => showModalUpdate(item._id)} />
                  </div>
                </List.Item>
              )}
              className="bg-zinc-50 basis-2/3"
            />
          )}
      </div>
      <Modal
        title={
          <div style={{ textAlign: "center", width: "100%" }}>ADD ROLE</div>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Submit">
        <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}>
          <Form.Item
            name="name"
            label="Role Name"
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z\s]+$/,
                message: "Only enter letters without accents or spaces",
              },
              {
                validator: (_, value) =>
                  value && value.trim().length > 0
                    ? Promise.resolve()
                    : Promise.reject("Not allowed just white space"),
              },
            ]}>
            <Input
              placeholder="name ..."
              onChange={(e) => setRoleName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z\s]+$/,
                message: "Only enter letters without accents or spaces",
              },
              {
                validator: (_, value) =>
                  value && value.trim().length > 0
                    ? Promise.resolve()
                    : Promise.reject("Not allowed just white space"),
              },
            ]}>
            <Input
              placeholder="description ..."
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div style={{ textAlign: "center", width: "100%" }}>
            ADD PERMISSION
          </div>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalPerOpen}
        onOk={handleSubmit}
        onCancel={handleCancelPer}
        okText="Submit">
        <Form
          {...layout}
          form={formPer}
          name="control-hooks"
          onFinish={onSubmitPer}
          style={{ maxWidth: 600 }}>
          <Form.Item
            name="code"
            label="Code"
            rules={[
              { required: true },
              {
                pattern: /^[A-Z_]+$/,
                message:
                  "Underscore are allowed, for example: PERMISSION_ADMIN",
              },
            ]}>
            <Input placeholder="code ..." />
          </Form.Item>
          <Form.Item
            name="description_permission"
            label="Description"
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z\s]+$/,
                message: "Only enter letters without accents or spaces",
              },
              {
                validator: (_, value) =>
                  value && value.trim().length > 0
                    ? Promise.resolve()
                    : Promise.reject("Not allowed just white space"),
              },
            ]}>
            <Input placeholder="description ..." />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={
          <div style={{ textAlign: "center", width: "100%" }}>
            UPDATE PERMISSION
          </div>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalUpdateOpen}
        onOk={handleUpdateSubmit}
        onCancel={handleCancelUpdate}
        okText="Submit">
        <Form
          {...layout}
          form={formUpdate}
          name="control-hooks"
          onFinish={onUpdateSubmit}
          style={{ maxWidth: 600 }}>
          <Form.Item
            initialValue={permisDetail?.code}
            name="code_update"
            label="Code"
            rules={[
              { required: true },
              {
                pattern: /^[A-Z_]+$/,
                message:
                  "Underscore are allowed, for example: PERMISSION_ADMIN",
              },
            ]}>
            <Input placeholder="code ..." />
          </Form.Item>
          <Form.Item
            initialValue={permisDetail?.description}
            name="description_update"
            label="Description"
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z\s]+$/,
                message: "Only enter letters without accents or spaces",
              },
              {
                validator: (_, value) =>
                  value && value.trim().length > 0
                    ? Promise.resolve()
                    : Promise.reject("Not allowed just white space"),
              },
            ]}>
            <Input placeholder="description ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
