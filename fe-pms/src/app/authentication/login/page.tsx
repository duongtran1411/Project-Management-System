"use client";
import { Form, Input, Flex, Button, Checkbox, Typography, Divider } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
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

const { Title, Text } = Typography;

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
    <div className="login-page-container">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="logo-container">
            <div className="logo-background">
              <Image
                width={180}
                src="/Project Hub logo.png"
                alt="Project Hub Logo"
                preview={false}
                className="brand-logo"
              />
            </div>
          </div>
          <div className="brand-text">
            <Title level={1} className="brand-title">
              Chào mừng bạn trở lại
            </Title>
            <Text className="brand-subtitle">
              Đăng nhập để tiếp tục quản lý dự án của bạn một cách hiệu quả
            </Text>
          </div>
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <Text strong>Quản lý dự án thông minh</Text>
                <Text type="secondary">
                  Theo dõi tiến độ và tối ưu hóa workflow
                </Text>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <Text strong>Làm việc nhóm hiệu quả</Text>
                <Text type="secondary">Cộng tác mượt mà với team của bạn</Text>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📈</div>
              <div className="feature-text">
                <Text strong>Báo cáo chi tiết</Text>
                <Text type="secondary">
                  Phân tích dữ liệu và đưa ra quyết định
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <Title level={2} className="form-title">
              Đăng nhập
            </Title>
            <Text className="form-subtitle">
              Vui lòng nhập thông tin đăng nhập của bạn
            </Text>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            className="login-form"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email của bạn!" },
                { type: "email", message: "Email phải có định dạng hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input
                prefix={<LockOutlined className="input-icon" />}
                type="password"
                placeholder="Mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
                className="custom-input"
              />
            </Form.Item>

            <Form.Item>
              <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="remember-me-checkbox">
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </Form.Item>
                <Link
                  href={"/authentication/forgot-password"}
                  className="forgot-password-link"
                >
                  Quên mật khẩu?
                </Link>
              </Flex>
            </Form.Item>

            <Form.Item>
              <Button
                block
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <Divider className="divider">
              <Text type="secondary">hoặc</Text>
            </Divider>

            <Form.Item>
              <div className="google-login-container">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    setLoading(true);
                    handleLoginGoogle(credentialResponse);
                  }}
                  onError={() => {
                    showErrorToast("Đăng nhập Google thất bại");
                  }}
                />
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
