import React from "react";

interface PasswordValidationProps {
  passwordValidation: {
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumbers: boolean;
    hasMinLength: boolean;
  };
}

export default function PasswordValidation({
  passwordValidation,
}: PasswordValidationProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Mật khẩu phải có:</div>
      <div className="space-y-1">
        <div
          className={`flex items-center text-xs ${
            passwordValidation.hasMinLength ? "text-green-600" : "text-gray-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              passwordValidation.hasMinLength ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          Ít nhất 8 ký tự
        </div>
        <div
          className={`flex items-center text-xs ${
            passwordValidation.hasNumbers ? "text-green-600" : "text-gray-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              passwordValidation.hasNumbers ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          Ít nhất 1 số (0-9)
        </div>
      </div>
    </div>
  );
}
