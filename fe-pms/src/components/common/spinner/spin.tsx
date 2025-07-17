export default function Spinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-200/50 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col justify-center items-center space-y-6">
          {/* Custom Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Đang xử lý...
            </h3>
            <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát</p>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
