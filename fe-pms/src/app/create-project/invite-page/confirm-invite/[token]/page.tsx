"use client";

import { Alert, Button, Spin, Typography, notification } from "antd";
import { useParams, useRouter } from "next/navigation";
import { CheckCircleOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import type { NotificationArgsProps } from "antd";
import { confirmInvite } from "@/lib/services/projectContributor/projectContributor";

const { Title, Text } = Typography;
type NotificationPlacement = NotificationArgsProps["placement"];

export default function ConfirmInviteSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const tokenConfirm = params.token as string;

  const [api, contextHolder] = notification.useNotification();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ thêm loading state

  const notificationSuccess = (placement: NotificationPlacement) => {
    api.success({
      message: "Confirm Invitation",
      description: "Invitation confirmed successfully",
      placement,
    });
  };

  const notificationError = (placement: NotificationPlacement) => {
    api.error({
      message: "Confirm Invitation",
      description: "Fail to confirm invitation",
      placement,
    });
  };

  useEffect(() => {
    const confirm = async (token: string) => {
      try {
        const response = await confirmInvite(token);
        if (!response) {
          setError(true);
          notificationError("topLeft");
        } else {
          notificationSuccess("topLeft");
        }
      } catch (e) {
        console.log(e);
        setError(true);
        notificationError("topLeft");
      } finally {
        setLoading(false); // ✅ tắt loading sau khi xử lý
      }
    };

    if (tokenConfirm) {
      confirm(tokenConfirm);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [tokenConfirm]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {contextHolder}
      {loading ? (
        <Spin tip="Đang xác nhận lời mời..." size="large" />
      ) : error ? (
        <Alert
          message="Xác nhận thất bại"
          description="Có lỗi xảy ra khi xác nhận lời mời. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
          type="error"
          showIcon
        />
      ) : (
        <>
          <CheckCircleOutlined style={{ fontSize: 72, color: "#52c41a" }} />
          <Title level={2} className="mt-4 text-center">
            Bạn đã tham gia dự án thành công!
          </Title>
          <Text className="text-gray-600 mb-6 text-center">
            Bây giờ bạn có thể bắt đầu làm việc cùng nhóm của mình.
          </Text>
          <Button type="primary" size="large" onClick={() => router.push("/")}>
            Về trang chủ
          </Button>
        </>
      )}
    </div>
  );
}
