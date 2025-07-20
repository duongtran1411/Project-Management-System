"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "antd";

interface LoadingWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  skeleton?: React.ReactNode;
  delay?: number;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  isLoading = false,
  skeleton,
  delay = 300,
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      setShowContent(false);
    } else {
      // Delay to prevent flash
      const timer = setTimeout(() => {
        setShowLoading(false);
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  if (showLoading) {
    return (
      <div className="fade-in">
        {skeleton || (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fade-in ${showContent ? "opacity-100" : "opacity-0"}`}>
      {children}
    </div>
  );
};

export default LoadingWrapper;
