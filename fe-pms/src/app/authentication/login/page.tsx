"use client";
import { Form, Input, Flex, Button, Checkbox, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { GoogleCredentialResponse, GoogleLogin } from "@react-oauth/google";
import { login, loginGoogle } from "@/lib/services/authentication/auth.service";
import { showErrorToast } from "@/components/common/toast/toast";
import { jwtDecode } from "jwt-decode";
import { Constants } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { TokenPayload } from "@/models/user/TokenPayload.model";
import { Image } from "antd";
import Spinner from "@/components/common/spinner/spin";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import PageWrapper from "@/components/common/spinner/PageWrapper";

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
        const refresh_token = response.data.refresh_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, refresh_token);
        if (!response || typeof response.success === "undefined") {
          throw new Error("Lỗi không xác định từ máy chủ");
        }
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);

          //Lưu thông tin người dùng
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
        const refresh_token = response.data.refresh_token;
        localStorage.setItem(Constants.API_TOKEN_KEY, token);
        localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, refresh_token);
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);

          localStorage.setItem("currentUser", JSON.stringify(decoded));

          // Cập nhật auth context
          loginSuccess(token);

          localStorage.setItem(Constants.API_FIRST_LOGIN, "true");

          router.replace(
            decoded.role === "USER" ? "/" : "/authentication/login"
          );
          return;
        }
      } else {
        // Xóa token cũ khi login thất bại
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
      localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);

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
    <PageWrapper>
      <div className="login-page-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-container">
              <Link href="/" className="logo-link">
                <div className="logo-background">
                  <Image
                    width={180}
                    src="/Project Hub logo.png"
                    alt="Project Hub Logo"
                    preview={false}
                    className="brand-logo"
                  />
                </div>
              </Link>
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
                  <Text type="secondary">
                    Cộng tác mượt mà với team của bạn
                  </Text>
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
            <Form onFinish={onFinish} layout="vertical">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  {
                    type: "email",
                    message: "Email must be include @example.com!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" },
                  {
                    pattern: /^[A-Za-z\d]{8,}$/,
                    message:
                      "Mật khẩu phải tối thiểu 8 ký tự, chỉ chứa chữ và số, không chứa khoảng trắng!",
                  },
                ]}
              >
                <Input
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Flex justify="space-between" align="center">
                  <Link
                    href={"/authentication/forgot-password"}
                    className="text-sm text-blue-500 hover:decoration-solid hover:underline"
                  >
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

              <div className="text-center mt-4">
                <Text type="secondary">
                  Chưa có tài khoản?{" "}
                  <Link
                    href="/authentication/register"
                    className="text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Đăng ký ngay
                  </Link>
                </Text>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
