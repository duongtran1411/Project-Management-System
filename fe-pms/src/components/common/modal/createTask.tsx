"use client";

import { Input, Button, Tooltip, Avatar, Select } from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  UserOutlined,
  SendOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Milestone } from "@/models/milestone/milestone.model";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
const { Option } = Select;
interface CreateTaskInputProps {
  onCreate: (taskName: string, milestonesId:string) => void;
}
const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data.data);

const CreateTaskInput: React.FC<CreateTaskInputProps> = ({ onCreate }) => {
  const [taskName, setTaskName] = useState("");
  const { projectId } = useParams<{ projectId: string }>();
  const [selectMileStoneId, setSelectMileStoneId] = useState<string>("");
  const [mileStoneActive, setMileStoneActive] = useState<Milestone[]>([]);
  const {
    data: mileStoneActiveData,
    error: mileStoneActiveError,
    isLoading: mileStoneActiveLoading,
    mutate: mileStoneActiveMutate,
  } = useSWR(`${Endpoints.Milestone.GET_BY_ACTIVE(projectId)}`, fetcher);

  useEffect(() => {
    if (mileStoneActiveData) {
      setMileStoneActive(mileStoneActiveData);
      setSelectMileStoneId(mileStoneActiveData[0]._id)
    }
  }, [mileStoneActiveData]);
  return (
    <div className="border rounded p-2">
      <Input
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="What needs to be done?"
        className="mb-2"
      />
      <Select
        value={selectMileStoneId}
        style={{ width: "100%" }}
        className="mb-2"
        onChange={(value) => {
            setSelectMileStoneId(value)
        }}>
        {Array.isArray(mileStoneActive) &&
          mileStoneActive.map((m) => (
            <Option value={m._id} key={m._id}>
              {m.name}
            </Option>
          ))}
      </Select>
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={() => {
          if (taskName.trim()) {
            onCreate(taskName.trim(), selectMileStoneId);
            setTaskName("");
          }
        }}>
        Add
      </Button>
    </div>
  );
};
export default CreateTaskInput;
