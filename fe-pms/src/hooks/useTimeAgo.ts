import { useState, useEffect } from "react";
import { getTimeAgo } from "@/helpers/utils";

export const useTimeAgo = (dateString: string) => {
  const [timeAgo, setTimeAgo] = useState(getTimeAgo(dateString));

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(getTimeAgo(dateString));
    };

    // Cập nhật ngay lập tức
    updateTime();

    // Cập nhật mỗi phút
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [dateString]);

  return timeAgo;
};
