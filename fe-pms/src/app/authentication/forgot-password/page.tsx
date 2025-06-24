"use client";
import { Form, Input, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useState } from "react";
import { forgotPassword } from "@/lib/services/authentication/auth";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import Link from "next/link";
export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const onFinish = async () => {
    try {
      debugger;
      const response = await forgotPassword(email);
      if (response.success) {
        setIsSuccess(true);
        showSuccessToast(response.message);
      } else {
        showErrorToast(response.message);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };
  return (
    <div className="border-2 rounded-xl border-gray-200 shadow-xl">
      <Form
        name="login"
        initialValues={{ remember: true }}
        style={{ maxWidth: 360 }}
        onFinish={onFinish}
        className="pl-4 pt-6">
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            marginBottom: "20px",
          }}>
          <Typography className="font-semibold text-3xl">
            Enter your email
          </Typography>
        </div>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Email must be include @example.com!" },
          ]}>
          <Input
            prefix={<MailOutlined />}
            placeholder="@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit" className="mb-2">
            Send new password
          </Button>
          {isSuccess && (
            <Button block type="text" className="mb-2">
              <Link href={"/authentication/login"}>Back to Login</Link>
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
}
