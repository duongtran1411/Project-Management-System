"use client";
import { Form, Input, Flex, Button, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { login, loginGoogle } from "@/lib/services/authentication/login";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/common/toast/toast";
import { Constants } from "@/lib/constants";
import { useRouter } from "next/navigation";
export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  //login
  const onFinish = async () => {
    debugger;
    try {
      const response = await login(email, password);
      if (response.success) {
        const token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, refresh_token);
        showSuccessToast("đăng nhập thành công");
        router.replace("/home");
      }
    } catch (error: any) {
      const errorMessage =
        error.response.data.message || error.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };

  //login with google
  const handleLoginGoogle = async (credentialReponse: any) => {
    try {
      debugger;
      const credential = credentialReponse.credential;
      if (!credential) {
        showErrorToast("Tài khoản email không tồn tại");
      }

      const response = await loginGoogle(credential);
      if (response) {
        const token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, refresh_token);
        router.replace("/home");
      }
    } catch (error: any) {
      const errorMessage =
        error.response.data.message || error.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
  };
  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      style={{ maxWidth: 360 }}
      onFinish={onFinish}>
      <Form.Item
        name="email"
        rules={[{ required: true, message: "Please input your email!" }]}>
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
          <a href="">Forgot password</a>
        </Flex>
      </Form.Item>

      <Form.Item>
        <Button block type="primary" htmlType="submit" className="mb-2">
          Log in
        </Button>
        <GoogleLogin onSuccess={handleLoginGoogle} />
      </Form.Item>
    </Form>
  );
}
