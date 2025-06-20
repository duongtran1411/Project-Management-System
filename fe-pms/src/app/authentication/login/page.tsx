"use client";
import { Form, Input, Flex, Button, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { login, loginGoogle } from "@/lib/services/authentication/auth";
import {
  showErrorToast,
} from "@/components/common/toast/toast";
import { jwtDecode } from "jwt-decode";
import { Constants } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { TokenPayload } from "@/models/user/TokenPayload";
import { Image } from "antd";
import Spinner from "@/components/common/spinner/spin";
import { User } from "@/models/user/User";
export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<User>();
  const router = useRouter();
  

  //login
  const onFinish = async () => {
    debugger;
    setLoading(true)
    try {
      const response = await login(email, password);
      if (response.success) {
        const token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, refresh_token);
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);
          if (decoded.role === "ADMIN") {
            router.replace("/admin");
          }

          if (decoded.role === "USER") {
            router.replace("/");
          }
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }finally{
      setLoading(false)
    }
  };

  //login with google
  const handleLoginGoogle = async (credentialReponse: any) => {
    setLoading(true);
    try {
      debugger;
      const credential = credentialReponse.credential;
      if (!credential) {
        showErrorToast("Tài khoản email không tồn tại");
      }

      const response = await loginGoogle(credential);
      if (response.success) {
        const token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, refresh_token);
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);
          if (decoded.role === "ADMIN") {
            router.replace("/admin");
          }

          if (decoded.role === "USER") {
            router.replace("/");
          }
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }finally{
      setLoading(false)
    }
  };

  if(loading){
    return <Spinner />
  }
  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      style={{ maxWidth: 360 }}
      onFinish={onFinish}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image
          width={300}
          src="/Project Hub logo.png"
          alt="Logo"
          preview={false} 
          className="mb-4"
        />
      </div>
      
      <Form.Item
        name="email"
        rules={[{ required: true, message: "Please input your email!" },
           { type: "email", message: "Email must be include @example.com!" }
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
