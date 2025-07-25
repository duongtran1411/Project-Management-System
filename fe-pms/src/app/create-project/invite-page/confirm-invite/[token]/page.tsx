"use client";

import { confirmInvite } from "@/lib/services/projectContributor/projectContributor.service";
import { HomeOutlined } from "@ant-design/icons";
import { Button, Result, Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

//type NotificationPlacement = NotificationArgsProps["placement"];

export default function ConfirmInviteSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const tokenConfirm = params.token as string;

  //const [api, contextHolder] = notification.useNotification();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirm = async (token: string) => {
      try {
        setLoading(true);
        const response = await confirmInvite(token);

        if (response) {
          setTimeout(() => {
            //notificationSuccess("topLeft");
            router.push("/");
          }, 1000);
          return;
        } else {
          setTimeout(() => {
            // notificationError("topLeft");
          }, 1000);
          setError(true);
        }
      } catch (e) {
        console.log(e);
        setError(true);
        //notificationError("topLeft");
      } finally {
        setLoading(false);
      }
    };

    if (typeof tokenConfirm === "string" && tokenConfirm.trim() !== "") {
      confirm(tokenConfirm);
    }
  }, [tokenConfirm]);

  // const notificationSuccess = (placement: NotificationPlacement) => {
  //   api.success({
  //     message: "Confirm Invitation",
  //     description: "Invitation confirmed successfully",
  //     placement,
  //   });
  // };

  // const notificationError = (placement: NotificationPlacement) => {
  //   api.error({
  //     message: "Confirm Invitation",
  //     description: "Fail to confirm invitation",
  //     placement,
  //   });
  // };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {/* {contextHolder} */}
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Result
          status="error"
          title="Xác nhận thất bại"
          subTitle={error}
          extra={[
            <Button
              type="primary"
              key="home"
              icon={<HomeOutlined />}
              onClick={() => router.push("/")}
            >
              Về trang chủ
            </Button>,
          ]}
        />
      ) : null}
    </div>
  );
}
