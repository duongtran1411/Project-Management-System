"use client";

import { Alert, Spin, notification } from "antd";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { NotificationArgsProps } from "antd";
import { confirmInvite } from "@/lib/services/projectContributor/projectContributor.service";

type NotificationPlacement = NotificationArgsProps["placement"];

export default function ConfirmInviteSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const tokenConfirm = params.token as string;

  const [api, contextHolder] = notification.useNotification();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirm = async (token: string) => {
      try {
        setLoading(true);
        const response = await confirmInvite(token);

        if (response) {
          notificationSuccess("topLeft");
          router.push("/");
          return;
        } else {
          setError(true);
          notificationError("topLeft");
        }
      } catch (e) {
        console.log(e);
        setError(true);
        notificationError("topLeft");
      } finally {
        setLoading(false);
      }
    };

    if (typeof tokenConfirm === "string" && tokenConfirm.trim() !== "") {
      confirm(tokenConfirm);
    }
  }, [tokenConfirm]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {contextHolder}
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert
          message="Xác nhận thất bại"
          description="Có lỗi xảy ra khi xác nhận lời mời. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
          type="error"
          showIcon
        />
      ) : null}
    </div>
  );
}
