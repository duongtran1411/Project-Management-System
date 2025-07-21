"use client";

import React, { useEffect, useState } from "react";

interface NoFOUCWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const NoFOUCWrapper: React.FC<NoFOUCWrapperProps> = ({
  children,
  fallback = <div className="min-h-screen bg-gray-50" />,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default NoFOUCWrapper;
