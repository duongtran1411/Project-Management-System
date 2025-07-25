"use client";
import PageWrapper from "@/components/common/spinner/PageWrapper";
import Footer from "@/components/homepage/Footer";
import Header from "@/components/homepage/Header";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  RocketOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic, Typography } from "antd";
import { useState } from "react";

import { showSuccessToast } from "@/components/common/toast/toast";
import ImageAnimation from "@/components/homepage/ImageAnimation";
import { useAuth } from "@/lib/auth/auth-context";
import { Constants } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const { Text, Title, Paragraph } = Typography;

export default function Page() {
  const [name, setName] = useState<string>("");
  const router = useRouter();
  const { userInfo } = useAuth();

  useEffect(() => {
    const justLoggedIn = localStorage.getItem(Constants.API_FIRST_LOGIN);
    if (userInfo && justLoggedIn === "true") {
      setName(userInfo?.fullname);
      showSuccessToast("Welcome to Project Hub!");
      localStorage.removeItem(Constants.API_FIRST_LOGIN);
    } else if (userInfo) {
      setName(userInfo.fullname);
    }
  }, [userInfo]);

  // Đảm bảo name luôn được cập nhật khi userInfo thay đổi
  useEffect(() => {
    if (userInfo?.fullname) {
      setName(userInfo.fullname);
    }
  }, [userInfo?.fullname]);

  const handleContinue = () => {
    const accessToken = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (accessToken) {
      router.push("/workspace");
    } else {
      showSuccessToast("Vui lòng đăng nhập trước khi tiếp tục!");
      router.push("/authentication/login");
    }
  };

  const features = [
    {
      icon: <TeamOutlined className="text-2xl text-blue-500" />,
      title: "Team Collaboration",
      description:
        "Work together seamlessly with real-time updates and shared workspaces",
    },
    {
      icon: <ProjectOutlined className="text-2xl text-green-500" />,
      title: "Project Management",
      description:
        "Organize tasks, track progress, and deliver projects on time",
    },
    {
      icon: <CheckCircleOutlined className="text-2xl text-purple-500" />,
      title: "Task Tracking",
      description:
        "Monitor task completion with detailed analytics and reporting",
    },
    {
      icon: <RocketOutlined className="text-2xl text-orange-500" />,
      title: "Agile Workflow",
      description:
        "Implement Scrum and Kanban methodologies for efficient delivery",
    },
  ];

  const stats = [
    { title: "Active Projects", value: 150, suffix: "+" },
    { title: "Team Members", value: 500, suffix: "+" },
    { title: "Tasks Completed", value: 2500, suffix: "+" },
    { title: "Success Rate", value: 98, suffix: "%" },
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                    <StarOutlined className="mr-2" />
                    Trusted by 1000+ teams worldwide
                  </div>

                  <Title
                    level={1}
                    className="text-5xl font-bold leading-tight text-gray-900 lg:text-6xl"
                  >
                    Connect every team,
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      task, and project
                    </span>
                    <br />
                    together with Project Hub
                  </Title>

                  <Paragraph className="text-xl leading-relaxed text-gray-600">
                    Streamline your workflow, boost productivity, and achieve
                    your goals faster with our comprehensive project management
                    platform.
                  </Paragraph>
                </div>

                {userInfo ? (
                  <div className="space-y-6">
                    <div className="p-6 border bg-white/80 backdrop-blur-sm rounded-2xl border-gray-200/50">
                      <Text className="text-2xl font-semibold text-gray-800">
                        Welcome back,{" "}
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          {name}
                        </span>
                        ! 👋
                      </Text>
                      <Text className="block mt-2 text-gray-600">
                        Ready to continue where you left off?
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      className="px-8 text-lg font-semibold transition-all duration-300 border-0 shadow-lg h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                      onClick={handleContinue}
                      icon={<ArrowRightOutlined />}
                    >
                      Continue to Workspace
                    </Button>
                  </div>
                ) : null}
              </div>

              {/* Right Content - Image Animation */}
              <div className="relative flex items-center justify-center">
                <div className="w-full max-w-2xl p-8 border shadow-2xl bg-white/60 backdrop-blur-sm rounded-3xl border-gray-200/50">
                  <ImageAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <Row gutter={[24, 24]} justify="center">
              {stats.map((stat, index) => (
                <Col xs={12} sm={6} lg={3} key={index}>
                  <Card className="text-center transition-shadow border-0 shadow-sm hover:shadow-md">
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                      valueStyle={{
                        color: "#3b82f6",
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <Title
                level={2}
                className="mb-4 text-4xl font-bold text-gray-900"
              >
                Everything you need to succeed
              </Title>
              <Paragraph className="max-w-3xl mx-auto text-xl text-gray-600">
                Powerful features designed to help teams work more efficiently
                and deliver better results
              </Paragraph>
            </div>

            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card
                    className="h-full text-center transition-all duration-300 border-0 shadow-sm hover:shadow-lg hover:-translate-y-1"
                    styles={{ body: { padding: "2rem 1.5rem" } }}
                  >
                    <div className="mb-4">{feature.icon}</div>
                    <Title
                      level={4}
                      className="mb-3 text-xl font-semibold text-gray-900"
                    >
                      {feature.title}
                    </Title>
                    <Paragraph className="text-gray-600">
                      {feature.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>
        <Footer />
      </div>
    </PageWrapper>
  );
}
