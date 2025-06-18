import React from "react";

const Header: React.FC = () => {
  return (
    <div className="flex items-center px-6 py-4 bg-white shadow-sm">
      <img src="/jira_icon.png" alt="Logo" className="h-8 w-8" />
      <h1 className="ml-3 text-xl font-semibold text-gray-800">Hub</h1>
    </div>
  );
};

export default Header;
