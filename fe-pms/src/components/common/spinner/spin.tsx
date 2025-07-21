export default function Spinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Simple Spinner */}
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>

        {/* Loading Text */}
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
