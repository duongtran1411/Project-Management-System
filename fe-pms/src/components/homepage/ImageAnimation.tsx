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
  const [slideDirection, setSlideDirection] = useState("right");

  useEffect(() => {
    const nextImageTimeout = setTimeout(() => {
      // Chuyển sang ảnh tiếp theo với hiệu ứng slide
      setSlideDirection("left");
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % imageList.length);
        setSlideDirection("right");
      }, 300);
    }, 8000); // Mỗi ảnh hiển thị 8 giây

    return () => {
      clearTimeout(nextImageTimeout);
    };
  }, [currentIndex]);

  return (
    <div className="flex justify-center items-center w-full">
      <div
        className="overflow-hidden rounded-2xl shadow-2xl"
        style={{
          width: "100%",
          maxWidth: "560px",
          height: "400px",
        }}
      >
        <div
          className={`w-full h-full transition-transform duration-500 ease-in-out ${
            slideDirection === "left"
              ? "transform -translate-x-full"
              : "transform translate-x-0"
          }`}
        >
          <img
            src={imageList[currentIndex]}
            alt="Slideshow"
            className="w-full h-full object-contain mx-auto block rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageAnimation;
