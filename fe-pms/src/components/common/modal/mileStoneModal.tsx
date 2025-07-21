"use client";
import React, { useEffect, useState } from "react";
import { Modal, Button, Typography, Space } from "antd";
import { CheckOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Milestone } from "@/models/milestone/milestone.model";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { useParams } from "next/navigation";
import { Select } from "antd";
import Spinner from "../spinner/spin";
import { getTaskNotDone } from "@/lib/services/task/task.service";
import { showErrorToast } from "../toast/toast";

const { Option } = Select;
const { Text, Paragraph } = Typography;

interface MileStoneModalProp {
  open: boolean;
  onCancel: () => void;
  onSave: (milestoneId: string, milestoneIdMove: string) => void;
}
const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data.data);

const MileStoneskModal: React.FC<MileStoneModalProp> = ({
  open,
  onCancel,
  onSave,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [mileStoneActive, setMileStoneActive] = useState<Milestone[]>([]);
  const [mileStoneNotStart, setMileStoneStart] = useState<Milestone[]>([]);
  const [selectMileStoneId, setSelectMileStoneId] = useState<string>("");
  const [selectMileStoneIdMove, setSelectMileStoneIdMove] =
    useState<string>("");
  const [numberTaskNotDone, setNumberTaskNotDone] = useState<number>();
  const { data, error, isLoading, mutate } = useSWR(
    `${Endpoints.Milestone.GET_BY_NOT_START(projectId)}`,
    fetcher
  );

  const {
    data: mileStoneActiveData,
    error: mileStoneActiveError,
    isLoading: mileStoneActiveLoading,
    mutate: mileStoneActiveMutate,
  } = useSWR(`${Endpoints.Milestone.GET_BY_ACTIVE(projectId)}`, fetcher);

  useEffect(() => {
    if (data && mileStoneActiveData) {
      setMileStoneStart(data);
      setMileStoneActive(mileStoneActiveData);
    }
  }, [data, mileStoneActiveData]);

  const handleNumberTaskNotDone = async (milestoneId: string) => {
    try {
      const response = await getTaskNotDone(milestoneId);
      if (response.success) {
        setNumberTaskNotDone(response.number);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Lỗi khi cập nhật tên task!";
      showErrorToast(message);
      throw error;
    }
  };

  useEffect(() => {
    if (data && mileStoneActiveData) {
      setMileStoneStart(data);
      setMileStoneActive(mileStoneActiveData);

      if (mileStoneActiveData.length > 0) {
        setSelectMileStoneId(mileStoneActiveData[0]._id);
        handleNumberTaskNotDone(mileStoneActiveData[0]._id);
      }
      if (data.length > 0) {
        setSelectMileStoneIdMove(data[0]._id);
      } else {
        setSelectMileStoneIdMove("");
      }
    }
  }, [data, mileStoneActiveData]);

  useEffect(() => {
    if (!open) {
      mileStoneActiveMutate();
      mutate();
      if (Array.isArray(mileStoneActiveData) && mileStoneActiveData.length > 0)
        setSelectMileStoneId(mileStoneActiveData[0]._id);
      else setSelectMileStoneId("");
    }
  }, [open]);

  if (error || mileStoneActiveError) {
    showErrorToast(error || mileStoneActiveError);
  }

  if (isLoading || mileStoneActiveLoading) {
    return <Spinner />;
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={550}
      closable={false}>
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
          <CheckOutlined className="text-green-400 font-xl" />
          <Text strong style={{ fontSize: 22 }}>
            Complete Milestone?
          </Text>
          <Select
            value={selectMileStoneId}
            style={{ width: "100%" }}
            onChange={(value) => {
              handleNumberTaskNotDone(value);
              setSelectMileStoneId(value);
            }}>
            {Array.isArray(mileStoneActive) &&
              mileStoneActive.map((m) => (
                <Option value={m._id} key={m._id}>
                  {m.name}
                </Option>
              ))}
          </Select>
          {numberTaskNotDone && (
            <Paragraph className="text-center text-gray-600 max-w-[90%]">
              Milestone này chứa {numberTaskNotDone} công việc chưa hoàn thành.
              <br />
              Bạn có muốn di chuyển các công việc này sang Milestone mới không?
            </Paragraph>
          )}
          {mileStoneNotStart.length > 0 ? (
            <Select
              defaultValue={
                mileStoneNotStart.length > 0 ? mileStoneNotStart[0]._id : ""
              }
              style={{ width: "100%" }}
              onChange={(value) => setSelectMileStoneIdMove(value)}>
              {Array.isArray(mileStoneNotStart) &&
                mileStoneNotStart.map((m) => (
                  <Option value={m._id} key={m._id}>
                    {m.name}
                  </Option>
                ))}
            </Select>
          ) : (
            <Paragraph className="text-red-400">
              Bạn cần tạo Milestone mới để chuyển các task chưa hoàn thành
            </Paragraph>
          )}
        </div>

        <div className="flex flex-row gap-3 justify-end ">
          <Button
            type="primary"
            block
            className="font-semibold bg-green-500 text-zinc-200"
            onClick={() => {
              onSave(selectMileStoneId, selectMileStoneIdMove);
              // console.log("from id", selectMileStoneId);
              // console.log("to id", selectMileStoneIdMove);
            }}>
            Hoàn thành Milestone
          </Button>
          <Button block onClick={onCancel}>
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MileStoneskModal;
