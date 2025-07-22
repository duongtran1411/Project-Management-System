"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  verifyRegistrationOTP,
  resendVerificationEmail,
} from "@/lib/services/authentication/auth.service";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import Link from "next/link";
import Image from "next/image";
import { LazyOTPInput } from "@/components/common/LazyComponents";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(any | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.replace("/authentication/register");
      return;
    }
    if (inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
    // Preload setup-account page
    router.prefetch("/authentication/setup-account");
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Chỉ cho phép số
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) return; // Chỉ cho phép 1 ký tự

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus vào ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      showErrorToast("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }

    if (!email) {
      showErrorToast("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyRegistrationOTP(email, otpString);

      if (response.success) {
        showSuccessToast(response.message);
        // Preload setup account page
        router.prefetch(
          `/authentication/setup-account?token=${encodeURIComponent(
            response.data.token
          )}`
        );
        // Redirect to setup account page
        router.replace(
          `/authentication/setup-account?token=${encodeURIComponent(
            response.data.token
          )}&email=${encodeURIComponent(email || "")}`
        );
      } else {
        showErrorToast(response.message);
      }
    } catch (error: any) {
      showErrorToast(error.message || "Xác thực thất bại");
      // Nếu OTP hết hạn, cho phép resend
      if (error.message?.includes("hết hạn")) {
        setCountdown(0); // Reset countdown để cho phép resend
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResendLoading(true);
    try {
      const response = await resendVerificationEmail(email);

      if (response.success) {
        showSuccessToast("Mã xác thực đã được gửi lại");
        setCountdown(120); // 2 phút countdown
      } else {
        showErrorToast(response.message);
      }
    } catch (error: any) {
      showErrorToast(error.message || "Gửi lại mã thất bại");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
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
        <p className="mt-2 text-center text-sm text-gray-600">
          Để hoàn tất quá trình thiết lập tài khoản, hãy nhập mã chúng tôi đã
          gửi đến:
        </p>
        <p className="mt-1 text-center text-sm font-medium text-gray-900">
          {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <Suspense
                fallback={
                  <div className="flex justify-center space-x-2">
                    {[...Array(6)].map((_, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 bg-gray-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                }
              >
                <LazyOTPInput
                  otp={otp}
                  onOtpChange={handleOtpChange}
                  onKeyDown={handleKeyDown}
                  inputRefs={inputRefs}
                />
              </Suspense>
            </div>

            {/* Verify Button */}
            <Button
              type="primary"
              size="large"
              onClick={handleVerify}
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              <Button
                type="link"
                icon={<ReloadOutlined />}
                onClick={handleResend}
                loading={resendLoading}
                disabled={countdown > 0}
                className="text-blue-600 hover:text-blue-500"
              >
                {countdown > 0
                  ? `Gửi lại mã (${Math.floor(countdown / 60)}:${(
                      countdown % 60
                    )
                      .toString()
                      .padStart(2, "0")})`
                  : "Bạn không nhận được email? Gửi lại email"}
              </Button>
            </div>

            {/* Back to Register */}
            <div className="text-center">
              <Link
                href="/authentication/register"
                className="text-blue-600 hover:text-blue-500 text-sm flex items-center justify-center"
              >
                <ArrowLeftOutlined className="mr-1" />
                Quay lại đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
