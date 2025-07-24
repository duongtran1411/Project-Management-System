"use client";

import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { setupAccount } from "@/lib/services/authentication/auth.service";
import {
  CheckCircleOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

export default function SetupAccountPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      showErrorToast("Token không hợp lệ hoặc đã hết hạn");
      router.replace("/authentication/register");
      return;
    }
  }, [token, router]);

  const handleSubmit = async (values: any) => {
    if (!token) {
      showErrorToast("Token không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const response = await setupAccount(
        token,
        values.fullName,
        values.password
      );

      if (response.success) {
        showSuccessToast(response.message);
        // Redirect to login page
        router.replace("/authentication/login");
      } else {
        showErrorToast(response.message);
        // Nếu token hết hạn, redirect về register
        if (
          response.message.includes("Token không hợp lệ") ||
          response.message.includes("hết hạn")
        ) {
          router.replace("/authentication/register");
        }
      }
    } catch (error: any) {
      showErrorToast(error.message || "Thiết lập tài khoản thất bại");
      // Nếu lỗi liên quan đến token, redirect về register
      if (
        error.message?.includes("Token") ||
        error.message?.includes("hết hạn")
      ) {
        router.replace("/authentication/register");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Token đã hết hạn
              </h2>
              <p className="text-gray-600 mb-6">
                Link thiết lập tài khoản đã hết hạn. Vui lòng đăng ký lại.
              </p>
              <Button
                type="primary"
                size="large"
                onClick={() => router.replace("/authentication/register")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Đăng ký lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="logo-link">
            <div className="logo-background">
              <Image
                width={180}
                height={60}
                src="/Project Hub logo.png"
                alt="Project Hub Logo"
                className="brand-logo"
              />
            </div>
          </Link>
        </div>
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />
            <span className="text-lg font-medium text-green-600">
              Đã xác minh địa chỉ email
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            {/* Full Name */}
            <Form.Item
              label="Họ tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên" },
                { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
                { max: 50, message: "Họ tên không được quá 50 ký tự" },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập họ tên"
                prefix={<UserOutlined className="text-gray-400" />}
                maxLength={50}
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Tạo mật khẩu"
                prefix={<LockOutlined className="text-gray-400" />}
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Tiếp tục
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mt-2">
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500"
              >
                Chính sách quyền riêng tư
              </Link>{" "}
              và{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Điều khoản dịch vụ
              </Link>{" "}
              của Google.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
