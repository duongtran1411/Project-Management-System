"use client";
import { Form, Input, Flex, Button, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { GoogleCredentialResponse, GoogleLogin } from "@react-oauth/google";
import { login, loginGoogle } from "@/lib/services/authentication/auth";
import { showErrorToast } from "@/components/common/toast/toast";
import { jwtDecode } from "jwt-decode";
import { Constants } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { TokenPayload } from "@/models/user/TokenPayload";
import { Image } from "antd";
import Spinner from "@/components/common/spinner/spin";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { loginSuccess } = useAuth();
  //login
  const onFinish = async () => {
    setLoading(true);
    try {
      debugger;
      const response = await login(email, password);
      if (response.success) {
        const token = response.data.access_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        if (!response || typeof response.success === "undefined") {
          throw new Error("Lỗi không xác định từ máy chủ");
        }
        loginSuccess(token);
        const decoded = jwtDecode<TokenPayload>(token);

        localStorage.setItem(Constants.API_FIRST_LOGIN, "true");
        router.replace(decoded.role === "USER" ? "/" : "/authentication/login");
        return;
      }

      localStorage.removeItem(Constants.API_TOKEN_KEY);
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

  //login with google
  const handleLoginGoogle = async (
    credentialReponse: GoogleCredentialResponse
  ) => {
    setLoading(true);
    try {
      const credential = credentialReponse.credential;
      if (!credential) {
        showErrorToast("Tài khoản email không tồn tại");
        return;
      }

      const response = await loginGoogle(credential);
      if (response.success) {
        const token = response.data.access_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        loginSuccess(token)
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);

          localStorage.setItem(Constants.API_FIRST_LOGIN, "true");

          router.replace(decoded.role === "USER" ? "/" : "/authentication/login");
          return;
        }
      } else {
        localStorage.removeItem(Constants.API_TOKEN_KEY);
        localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);

        const message =
          typeof response?.data?.message === "string"
            ? response.data.message
            : response?.message || "Đăng nhập thất bại";
        showErrorToast(message);
      }
    } catch (error: any) {
      // Xóa token cũ khi có lỗi
      localStorage.removeItem(Constants.API_TOKEN_KEY);

      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="border-2 border-gray-200 shadow-xl rounded-xl">
      <Form
        name="login"
        initialValues={{ remember: true }}
        style={{ maxWidth: 360 }}
        onFinish={onFinish}
        className="pt-6 pl-4">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            width={300}
            src="/Project Hub logo.png"
            alt="Logo"
            preview={false}
            className="mb-8"
          />
        </div>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Email must be include @example.com!" },
          ]}>
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}>
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link
              href={"/authentication/forgot-password"}
              className="text-sm text-blue-500 hover:decoration-solid hover:underline">
              Forgot password?
            </Link>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit" className="mb-2">
            Log in
          </Button>

          <GoogleLogin
            onSuccess={(credentialResponse) => {
              setLoading(true); // Đảm bảo bật spinner ngay lập tức
              handleLoginGoogle(credentialResponse);
            }}
            onError={() => {
              showErrorToast("Đăng nhập Google thất bại");
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
