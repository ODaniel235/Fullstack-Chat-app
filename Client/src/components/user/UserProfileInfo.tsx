import React from "react";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import formatDate from "@/utils/formatDate";

interface UserProfileInfoProps {
  user: {
    email: string;
    phone?: string;
    location?: string;
    createdAt?: any;
  };
}

export const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-4 mt-2">
      <h2 className="text-lg font-semibold mb-4">Contact Information</h2>

      <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
        <Mail className="w-5 h-5" />
        <span>{user.email}</span>
      </div>

      {user.phone && (
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 justify-center">
          <Phone className="w-5 h-5" />
          <span>{user.phone}</span>
        </div>
      )}

      {user.location && (
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <MapPin className="w-5 h-5" />
          <span>{user.location}</span>
        </div>
      )}

      {user.createdAt && (
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <Calendar className="w-5 h-5" />
          <span>Joined {formatDate(user.createdAt, "date")}</span>
        </div>
      )}
    </div>
  );
};
