import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Mic, Video } from "lucide-react";
import { JoinGroupModal } from "./JoinGroupModal";

import { sampleGroups } from "../../data";

export const GroupList: React.FC = () => {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = React.useState(false);


  const renderLastMessage = (message: any) => {
    switch (message.type) {
      case "audio":
        return (
          <span
            className={`flex items-center ${
              message.isRead
                ? "text-gray-500"
                : "text-gray-900 dark:text-white font-semibold"
            }`}
          >
            <Mic
              className={`w-4 h-4 mr-1 ${
                message.isRead ? "stroke-1" : "stroke-2"
              }`}
            />
            Voice message
          </span>
        );
      case "video":
        return (
          <span
            className={`flex items-center ${
              message.isRead
                ? "text-gray-500"
                : "text-gray-900 dark:text-white font-semibold"
            }`}
          >
            <Video
              className={`w-4 h-4 mr-1 ${
                message.isRead ? "stroke-1" : "stroke-2"
              }`}
            />
            Video message
          </span>
        );
      default:
        return (
          <span
            className={
              message.isRead
                ? "text-gray-500"
                : "text-gray-900 dark:text-white font-semibold"
            }
          >
            {message.sender} - {message.content}
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-x-hidden">
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <h1 className="text-xl font-semibold">Groups</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sampleGroups && sampleGroups.length > 0 ? (
          <div className="divide-y dark:divide-gray-700">
            {sampleGroups.map((group) => (
              <motion.div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={group.avatar}
                      alt={group.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {group.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {group.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{group.name}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(group.lastActivity).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {group.lastMessage && (
                      <div className="text-sm">
                        {renderLastMessage(group.lastMessage)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">No Group Chats</h2>
              <p className="text-gray-500">Join a group to start chatting</p>
            </div>
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowJoinModal(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <JoinGroupModal
        group
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};
