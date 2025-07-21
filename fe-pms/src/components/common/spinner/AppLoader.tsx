"use client";

import React, { useEffect, useState } from "react";
import { Spin } from "antd";

interface AppLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  children,
  fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
      </div>
    </div>
  ),
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Đảm bảo CSS đã được load
    const checkCSSReady = () => {
      const styleSheets = Array.from(document.styleSheets);
      const hasAntdCSS = styleSheets.some(
        (sheet) =>
          sheet.href?.includes("antd") || sheet.href?.includes("reset.css")
      );

      if (hasAntdCSS || styleSheets.length > 0) {
        setIsReady(true);
      } else {
        // Fallback: set ready after a short delay
        setTimeout(() => setIsReady(true), 100);
      }
    };

    // Kiểm tra ngay lập tức
    checkCSSReady();

    // Fallback timeout
    const timeout = setTimeout(() => setIsReady(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  if (!isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AppLoader;
