import { Spin } from "antd";

export default function Spinner() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="flex flex-col justify-center items-center h-64">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">Đang xử lý...</p>
        </div>
      </div>
    </div>
  );
}
