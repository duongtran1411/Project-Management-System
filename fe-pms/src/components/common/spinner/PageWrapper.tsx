"use client";

import React, { useEffect, useState } from "react";
import { Spin } from "antd";

interface PageWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  fallback?: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  loading = false,
  fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  ),
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <>{fallback}</>;
  }

  return <div className="fade-in">{children}</div>;
};

export default PageWrapper;
