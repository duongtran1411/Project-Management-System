"use client";

import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { useAuth } from "@/lib/auth/auth-context";
import { Constants } from "@/lib/constants";
import {
  loginGoogle,
  register,
} from "@/lib/services/authentication/auth.service";
import { TokenPayload } from "@/models/user/TokenPayload.model";
import { MailOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleCredentialResponse, GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginSuccess } = useAuth();

  const handleRegister = async () => {
    if (!email) {
      showErrorToast("Vui lòng nhập email");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorToast("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const response = await register(email);

      if (response.success) {
        showSuccessToast(response.message);
        // Preload the verify-otp page
        router.prefetch(
          `/authentication/verify-otp?email=${encodeURIComponent(email)}`
        );
        // Redirect to OTP verification page with replace to avoid back button issues
        router.replace(
          `/authentication/verify-otp?email=${encodeURIComponent(email)}`
        );
      } else {
        showErrorToast(response.message);
      }
    } catch (error: any) {
      showErrorToast(error.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginGoogle = async (
    credentialResponse: GoogleCredentialResponse
  ) => {
    setLoading(true);
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        showErrorToast("Tài khoản email không tồn tại");
        return;
      }

      const response = await loginGoogle(credential);
      if (response.success) {
        const token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, refresh_token);
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);

          localStorage.setItem("currentUser", JSON.stringify(decoded));

          // Cập nhật auth context
          loginSuccess(token);

          localStorage.setItem(Constants.API_FIRST_LOGIN, "true");
          router.replace(decoded.role === "ADMIN" ? "/admin" : "/");
        }
        return;
      }

      localStorage.removeItem(Constants.API_TOKEN_KEY);
      localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
      const message =
        typeof response?.data?.message === "string"
          ? response.data.message
          : response?.message || "Đăng nhập thất bại";
      showErrorToast(message);
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
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  size="large"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  prefix={<MailOutlined className="text-gray-400" />}
                  className="w-full"
                />
              </div>
            </div>

            <div className="text-xs text-gray-600">
              Bằng việc đăng ký, tôi chấp nhận{" "}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                Điều khoản dịch vụ
              </Link>{" "}
              và công nhận{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                Chính sách quyền riêng tư
              </Link>
            </div>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Đang gửi mã xác thực..." : "Đăng ký"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  setLoading(true); // Đảm bảo bật spinner ngay lập tức
                  handleLoginGoogle(credentialResponse);
                }}
                onError={() => {
                  showErrorToast("Đăng nhập Google thất bại");
                }}
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Bạn đã có tài khoản?{" "}
              <Link
                href="/authentication/login"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                Đăng nhập
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
