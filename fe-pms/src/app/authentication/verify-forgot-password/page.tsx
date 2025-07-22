"use client";

import { Constants } from "@/lib/constants";
import {
  verifyOTP,
  forgotPassword,
} from "@/lib/services/authentication/auth.service";
import {
  Button,
  Form,
  Input,
  message,
  Typography,
  Alert,
  Card,
  Space,
  Divider,
} from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  LockOutlined,
  KeyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [messageSuccess, setMessageSuccess] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [otpExpired, setOtpExpired] = useState(false);
  const router = useRouter();

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timeLeft > 0 && !isSuccess) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, isSuccess]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      // Get email from localStorage or you might need to store it when user enters it
      const email = localStorage.getItem("forgot_password_email");
      if (!email) {
        message.error(
          "Không tìm thấy thông tin email. Vui lòng thử lại từ trang quên mật khẩu!"
        );
        return;
      }

      const response = await forgotPassword(email);
      if (response && response.success) {
        setTimeLeft(15 * 60);
        setOtpExpired(false);
        setErrorMessage("");
        message.success("Mã OTP mới đã được gửi đến email của bạn!");
      } else {
        message.error(
          response?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại!"
        );
      }
    } catch {
      message.error("Không thể gửi lại mã OTP. Vui lòng thử lại!");
    } finally {
      setResendLoading(false);
    }
  };

  const onFinish = async () => {
    const values = form.getFieldsValue();
    const otp = values.otp || [];
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setErrorMessage("Vui lòng nhập đủ 6 số OTP!");
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (otpExpired) {
      setErrorMessage("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới!");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const otpToken = localStorage.getItem(Constants.API_VERIFY);
      const response = await verifyOTP(
        otpCode,
        otpToken ? otpToken : "",
        values.newPassword
      );

      if (response && response.success) {
        setIsSuccess(true);
        setMessageSuccess(response.message || "Đổi mật khẩu thành công!");
        localStorage.removeItem(Constants.API_VERIFY);
        message.success("Đổi mật khẩu thành công!");
      } else {
        setErrorMessage(response?.message || "Có lỗi xảy ra khi xác thực OTP!");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);

      // Handle specific error cases
      if (error?.response?.status === 400) {
        const errorMsg =
          error?.response?.data?.message ||
          "Mã OTP không đúng hoặc đã hết hạn!";
        setErrorMessage(errorMsg);

        // Clear OTP fields on error
        form.setFieldsValue({ otp: [] });
        inputsRef.current[0]?.focus();
      } else {
        setErrorMessage("Có lỗi xảy ra! Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card
        className="w-full max-w-md shadow-2xl border-0"
        bodyStyle={{ padding: "2rem" }}
        style={{
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyOutlined className="text-2xl text-blue-600" />
            </div>
            <Title level={2} className="!mb-2 !text-gray-800">
              Xác thực OTP
            </Title>
            <Text className="text-gray-600">
              Nhập mã xác thực 6 số đã được gửi đến email của bạn
            </Text>
          </div>

          {/* OTP Expiration Timer */}
          {!isSuccess && !otpExpired && (
            <Alert
              message={
                <Space>
                  <ClockCircleOutlined />
                  <span>
                    Mã OTP có hiệu lực trong:{" "}
                    <strong>{formatTime(timeLeft)}</strong>
                  </span>
                </Space>
              }
              type="info"
              showIcon={false}
              className="mb-4"
              style={{
                background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                border: "1px solid #90caf9",
              }}
            />
          )}

          {otpExpired && (
            <Alert
              message="Mã OTP đã hết hạn"
              description="Vui lòng yêu cầu mã OTP mới"
              type="warning"
              showIcon
              className="mb-4"
            />
          )}
        </div>

        {!isSuccess ? (
          <Form form={form} onFinish={onFinish} layout="vertical" size="large">
            {/* OTP Input */}
            <Form.Item label="Mã xác thực OTP" required>
              <div className="flex justify-center gap-3 mb-4">
                {[...Array(6)].map((_, idx) => (
                  <Form.Item
                    key={idx}
                    name={["otp", idx]}
                    noStyle
                    rules={[
                      { required: true, message: "" },
                      { pattern: /^[0-9]$/, message: "" },
                    ]}
                    normalize={(value) => value?.slice(-1)}
                  >
                    <Input
                      ref={(el) => (inputsRef.current[idx] = el?.input || null)}
                      maxLength={1}
                      disabled={otpExpired}
                      className="text-center text-xl font-semibold"
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        border: "2px solid #e5e7eb",
                        transition: "all 0.2s",
                      }}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 2px rgba(59, 130, 246, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </Form.Item>
                ))}
              </div>
            </Form.Item>

            {/* Password Fields */}
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                {
                  pattern: /^[A-Za-z\d]{8,}$/,
                  message:
                    "Mật khẩu phải tối thiểu 8 ký tự, chỉ chứa chữ và số!",
                },
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu mới"
                prefix={<LockOutlined className="text-gray-400" />}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value)
                      return Promise.resolve();
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu mới"
                prefix={<LockOutlined className="text-gray-400" />}
                className="rounded-lg"
              />
            </Form.Item>

            {/* Error Message */}
            {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                className="mb-4"
                closable
                onClose={() => setErrorMessage("")}
              />
            )}

            {/* Submit Button */}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              disabled={otpExpired}
              className="h-12 rounded-lg font-semibold text-base"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                boxShadow: "0 4px 14px 0 rgba(116, 75, 162, 0.39)",
              }}
            >
              {loading ? "Đang xác thực..." : "Xác nhận & Đổi mật khẩu"}
            </Button>

            {/* Resend OTP Button */}
            {otpExpired && (
              <div className="mt-4">
                <Button
                  type="default"
                  onClick={handleResendOTP}
                  loading={resendLoading}
                  block
                  size="large"
                  className="h-12 rounded-lg"
                >
                  {resendLoading ? "Đang gửi..." : "Gửi lại mã OTP"}
                </Button>
              </div>
            )}
          </Form>
        ) : (
          /* Success State */
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleOutlined className="text-2xl text-green-600" />
              </div>
              <Title level={3} className="!mb-2 !text-green-800">
                Thành công!
              </Title>
              <Text className="text-gray-600">
                {messageSuccess || "Mật khẩu của bạn đã được đổi thành công"}
              </Text>
            </div>

            <Button
              type="primary"
              onClick={() => router.push("/authentication/login")}
              size="large"
              className="h-12 rounded-lg font-semibold text-base"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
              }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}

        {/* Back to Login Link */}
        {!isSuccess && (
          <div className="text-center mt-6">
            <Divider plain>
              <Text type="secondary">hoặc</Text>
            </Divider>
            <Button
              type="link"
              onClick={() => router.push("/authentication/login")}
              className="text-gray-600 hover:text-blue-600"
            >
              Quay lại trang đăng nhập
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
