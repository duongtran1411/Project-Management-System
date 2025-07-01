"use client";
import React, { useEffect, useState } from "react";

const imageList = [
  "/frame.png",
  "/jira_detail.png",
  "/board.png",
  "/assignee.png",
  "/choose_assignee.png",
];

const ImageAnimation: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Bắt đầu hiệu ứng mở
    setExpanded(true);

    const closeTimeout = setTimeout(() => {
      // Đóng lại
      setExpanded(false);
    }, 4000); // Sau 4s thì bắt đầu thu lại

    const nextImageTimeout = setTimeout(() => {
      // Chuyển sang ảnh tiếp theo
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
      setExpanded(true); // Mở lại ảnh tiếp theo
    }, 7000); // Sau 5s chuyển ảnh

    return () => {
      clearTimeout(closeTimeout);
      clearTimeout(nextImageTimeout);
    };
  }, [currentIndex]);

  return (
    <div>
      <div
        className={`overflow-hidden transition-all duration-1000 ease-in-out ${
          expanded ? "h-[400px]" : "h-[10px]"
        } `}
        style={{ width: "560px" }}
      >
        <img
          src={imageList[currentIndex]}
          alt="Slideshow"
          className="w-full h-full object-contain mx-auto block rounded-2xl shadow-[#0000001a_0px_18px_40px_0px]"
        />
      </div>
    </div>
  );
};

export default ImageAnimation;
