'use client'
import React from "react";
import { Button, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Constants } from "@/lib/constants";
import { useEffect, useState } from "react";
import Link from "next/link";
const Header: React.FC = () => {
  const [token, setToken ] = useState('');
  
  const userName = "John Doe"; 
  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if(access_token){
      setToken(access_token);
    }
  }, []);
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="flex items-center">
        <img src="/jira_icon.png" alt="Logo" className="h-8 w-8" />
        <h1 className="ml-3 text-xl font-semibold text-gray-800">Hub</h1>
      </div>

      <div>
        {token ? (
          <Space className="cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="text-gray-700">{userName}</span>
          </Space>
        ) : (
          <Button type="primary" className="bg-blue-500 hover:bg-blue-600">
            <Link href={'/authentication/login'}>Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
