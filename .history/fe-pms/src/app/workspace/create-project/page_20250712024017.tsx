"use client";

import { useEffect, useState } from "react";
import { Input, Button, Card, Typography, Row, Col } from "antd";
import { Constants } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/models/user/TokenPayload";

const { Title, Text } = Typography;

export default function ProjectForm() {
  const [name, setName] = useState<string>("");
  const [key, setKey] = useState<string>("");
  //const [access, setAccess] = useState("Private");
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      const decoded = jwtDecode<TokenPayload>(access_token);
      setUserId(decoded.userId);
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Title level={2}>Add project details</Title>
      <Text className="text-gray-600">
        Explore what’s possible when you collaborate with your team. Edit
        project details anytime in project settings.
      </Text>

      <div className="mt-6 space-y-4">
        <div>
          <Text strong>Name *</Text>
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Text strong>Key *</Text>
          <Input
            placeholder="Project key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>

        {/* <div>
          <Text strong>Access *</Text>
          <Select
            value={access}
            onChange={(value) => setAccess(value)}
            className="w-full"
            suffixIcon={<LockOutlined />}
          >
            <Option value="Private">Private</Option>
            <Option value="Public">Public</Option>
          </Select>
        </div> */}

        <Row gutter={24}>
          <Col span={12}>
            <Text strong>Template</Text>
            <Card className="mt-2 border-2 border-blue-500 hover:border-blue-600 transition-all">
              <Text className="text-lg font-medium">Scrum</Text>
              <p className="text-sm text-gray-500">
                Sprint toward your project goals with a board, backlog, and
                timeline.
              </p>
            </Card>
          </Col>

          <Col span={12}>
            <Text strong>Type</Text>
            <Card className="mt-2 border-2 border-purple-500 hover:border-purple-600 transition-all">
              <Text className="text-lg font-medium text-purple-700">
                Team-managed
              </Text>
              <p className="text-sm text-gray-500">
                Control your own working processes in a self-contained space.
              </p>
            </Card>
          </Col>
        </Row>

        <div className="flex justify-end space-x-2 mt-4">
          <Button>Cancel</Button>
          <Button type="primary">Next</Button>
        </div>
      </div>
    </div>
  );
}
