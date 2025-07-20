import React from "react";
import { toast } from "sonner";

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    style: { backgroundColor: "#4CAF50", color: "white" },
  });
};

export const showErrorToast = (message: unknown) => {
  const errorMessage =
    typeof message === "string"
      ? message
      : (message as any)?.response?.data?.message ||
        (message as any)?.message ||
        "Đã xảy ra lỗi";

  toast.error(errorMessage, {
    style: { backgroundColor: "#F44336", color: "white" },
  });
};

export const showWarningToast = (message: string) => {
  toast(
    <div>
      <span className="font-bold">{message}</span>
    </div>,
    { className: "bg-yellow-500 text-black" }
  );
};

export const showInfoToast = (message: string) => {
  toast(
    <div>
      <span className="font-bold">{message}</span>
    </div>,
    { className: "bg-blue-500 text-white" }
  );
};
