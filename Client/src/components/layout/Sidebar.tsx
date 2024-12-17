import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, Users2, Settings, CircleDot } from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-full flex flex-col items-center py-4 space-y-4">
        <NavLink
          to="/chats"
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive || location.pathname.startsWith("/chat")
                ? "bg-blue-100 dark:bg-blue-900"
                : ""
            }`
          }
        >
          <MessageSquare className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/status"
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive ? "bg-blue-100 dark:bg-blue-900" : ""
            }`
          }
        >
          <CircleDot className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/groups"
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive ? "bg-blue-100 dark:bg-blue-900" : ""
            }`
          }
        >
          <Users2 className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive ? "bg-blue-100 dark:bg-blue-900" : ""
            }`
          }
        >
          <Settings className="w-6 h-6" />
        </NavLink>
      </div>
    </nav>
  );
};
