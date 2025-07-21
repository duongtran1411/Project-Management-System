"use client";

import { Constants } from "@/lib/constants";
import { verifyOTP } from "@/lib/services/authentication/auth.service";
import { Button, Form, Input, message } from "antd";
import { useRef, useState } from "react";
import { Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [messageSuccess, setMessageSuccess] = useState<string>("");
  const router = useRouter();
  const onFinish = async () => {
    const values = form.getFieldsValue();
    const otp = values.otp || [];
    const otpCode = otp.join("");

    if (otpCode.length !== 6)
      return message.error("Vui lòng nhập đủ 6 số OTP!");
    if (values.newPassword !== values.confirmPassword)
      return message.error("Mật khẩu xác nhận không khớp!");

    try {
      setLoading(true);
      console.log("OTP:", otpCode);
      console.log("New Password:", values.newPassword);
      const otpToken = localStorage.getItem(Constants.API_VERIFY);
      const response = await verifyOTP(
        otpCode,
        otpToken ? otpToken : "",
        values.newPassword
      );
      if (response.success) {
        setIsSuccess(true);
        setMessageSuccess(response.message);
        localStorage.removeItem(Constants.API_VERIFY);
      }
      message.success("Đổi mật khẩu thành công!");
    } catch {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Xác nhận OTP & Đổi mật khẩu
        </h2>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item label="Mã OTP" required>
            <div className="flex justify-between gap-2">
              {[...Array(6)].map((_, idx) => (
                <Form.Item
                  key={idx}
                  name={["otp", idx]}
                  noStyle
                  rules={[
                    { required: true, message: "" },
                    { pattern: /^[0-9]$/, message: "" },
                  ]}
                  normalize={(value) => value?.slice(-1)}>
                  <Input
                    ref={(el) => (inputsRef.current[idx] = el?.input || null)}
                    maxLength={1}
                    style={{
                      width: 45,
                      height: 45,
                      textAlign: "center",
                      fontSize: "20px",
                      borderRadius: "8px",
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !e.currentTarget.value &&
                        idx > 0
                      )
                        inputsRef.current[idx - 1]?.focus();
                    }}
                  />
                </Form.Item>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              {
                pattern: /^[A-Za-z\d]{8,}$/,
                message:
                  "Mật khẩu phải tối thiểu 8 ký tự, chỉ chứa chữ và số, không chứa khoảng trắng!",
              },
            ]}>
            <Input.Password placeholder="Nhập mật khẩu mới" />
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
            ]}>
            <Input.Password placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          {isSuccess && messageSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 text-center">
              <Typography.Text className="text-green-800">
                {messageSuccess} 
              </Typography.Text>
            </div>
          )}

          {!isSuccess && (
            <Button type="primary" htmlType="submit" loading={loading} block>
              Xác nhận
            </Button>
          )}
          {isSuccess && (
            <Button
              type="primary"
              onClick={() => router.push("/authentication/login")}
              className="w-full">
              Quay lại trang login
            </Button>
          )}
        </Form>
      </div>
    </div>
  );
}
