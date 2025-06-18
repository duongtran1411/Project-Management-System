import React from "react"
import { toast } from "sonner"

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    style: { backgroundColor: "#4CAF50", color: "white" },
  })
}

export const showErrorToast = (message: string) => {
  toast.error(message, {
    style: { backgroundColor: "#F44336", color: "white" },
  })
}

export const showWarningToast = (message: string) => {
  toast(
    <div>
      <span className="font-bold">{message}</span>
    </div>,
    { className: "bg-yellow-500 text-black" },
  )
}

export const showInfoToast = (message: string) => {
  toast(
    <div>
      <span className="font-bold">{message}</span>
    </div>,
    { className: "bg-blue-500 text-white" },
  )
}
