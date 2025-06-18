import React from "react";
import { Button, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  // TODO: Replace with actual auth state
  const isLoggedIn = false;
  const userName = "John Doe"; // TODO: Replace with actual user name

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="flex items-center">
        <img src="/jira_icon.png" alt="Logo" className="h-8 w-8" />
        <h1 className="ml-3 text-xl font-semibold text-gray-800">Hub</h1>
      </div>

      <div>
        {isLoggedIn ? (
          <Space
            className="cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <Avatar icon={<UserOutlined />} />
            <span className="text-gray-700">{userName}</span>
          </Space>
        ) : (
          <Button
            type="primary"
            onClick={() => navigate("/login")}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
