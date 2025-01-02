import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Video } from "lucide-react";

interface UserProfileHeaderProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    status: string;
  };
  onMessage: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  onMessage,
  onAudioCall,
  onVideoCall,
}) => {
  return (
    <div className="relative">
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500" />
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={
            user.avatar ||
            "https://res.cloudinary.com/dvtuuqtdb/image/upload/v1719960554/images/ryjefb8seoqbaizc7fc3.jpg"
          }
          alt={user.name}
          className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
        />
        <div className="ml-6 flex-1">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm ${
              user.status === "online"
                ? "bg-green-100 text-green-800"
                : user.status === "away"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {user.status}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onMessage}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button
            onClick={onAudioCall}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <Phone className="w-6 h-6" />
          </button>
          <button
            onClick={onVideoCall}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <Video className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
