"use client";
import { Form, Input, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useState } from "react";
import { forgotPassword } from "@/lib/services/authentication/auth.service";
import { showErrorToast } from "@/components/common/toast/toast";
import Link from "next/link";
import { Constants } from "@/lib/constants";

export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const onFinish = async () => {
    try {
      setLoading(true);
      const response = await forgotPassword(email);
      if (response.success) {
        setIsSuccess(true);
        localStorage.setItem(Constants.API_VERIFY, response.data.token);
      } else {
        setErrorMessage(response.message);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Typography.Title level={2} className="text-gray-900 font-bold">
            Quên mật khẩu
          </Typography.Title>
          <Typography.Text className="text-gray-600">
            Nhập email của bạn để nhận mật khẩu mới
          </Typography.Text>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <Form
            name="forgotPassword"
            layout="vertical"
            onFinish={onFinish}
            className="space-y-6">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email của bạn!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}>
              <Input
                size="large"
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md"
              />
            </Form.Item>
            {!isSuccess && (
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-full h-12 text-base font-medium rounded-md">
                  Xác nhận email
                </Button>
              </Form.Item>
            )}

            {isSuccess && (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <Typography.Text className="text-green-800">
                    Email đã được gửi thành công! Vui lòng kiểm tra hộp thư của
                    bạn.
                  </Typography.Text>
                </div>
                <Button
                  type="text"
                  className="text-blue-600 hover:text-blue-800">
                  <Link href="/authentication/verify-forgot-password">
                    Nhập OTP
                  </Link>
                </Button>
              </div>
            )}

            {!isSuccess && errorMessage && (
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <Typography.Text className="text-red-800">
                    {errorMessage}
                  </Typography.Text>
                </div>
              </div>
            )}
          </Form>
          <div className="text-center mt-4">
            <Button
              type="link"
              className="text-blue-600 hover:text-blue-800 p-0">
              <Link href="/authentication/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
