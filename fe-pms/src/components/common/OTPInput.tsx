import React from "react";
import { Input } from "antd";

interface OTPInputProps {
  otp: string[];
  onOtpChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent) => void;
  inputRefs: React.MutableRefObject<(any | null)[]>;
}

export default function OTPInput({
  otp,
  onOtpChange,
  onKeyDown,
  inputRefs,
}: OTPInputProps) {
  return (
    <div className="flex justify-center space-x-2">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => ((inputRefs.current[index] as any) = el)}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => onOtpChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          className="w-12 h-12 text-center text-lg font-semibold"
          style={{ fontSize: "18px" }}
        />
      ))}
    </div>
  );
}
