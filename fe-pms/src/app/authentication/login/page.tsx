"use client";
import { Form, Input, Flex, Button, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axiosService from "@/lib/services/axios.service";
import { Endpoints } from "@/lib/endpoints";
export default function Page() {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const onFinish = () => {};
  const handleLoginGoogle = async () => {
    const response = await axiosService.getAxiosInstance().get(`${Endpoints.Auth.LOGIN_WITH_GOOGLE}`)
  }
  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      style={{ maxWidth: 360 }}
      onFinish={onFinish}>
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Please input your Username!" }]}>
        <Input prefix={<UserOutlined />} placeholder="Username" onChange={(e)=>setEmail(e.target.value)}/>
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your Password!" }]}>
        <Input
          prefix={<LockOutlined />}
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
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
        <Button block type="primary" htmlType="submit">
          Log in
        </Button>
        <GoogleLogin onSuccess={handleLoginGoogle}/>
        or <a href="">Register now!</a>
      </Form.Item>
    </Form>
  );
}
