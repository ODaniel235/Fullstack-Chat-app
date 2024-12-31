import React from "react";
import { motion } from "framer-motion";
import { Message } from "../../types";
import VideoMessage from "./VideoMessage";
import AudioMessage from "./AudioMessage";
import useAuthStore from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import MessageSkeleton from "../skeletons/MessageSkeleton";

export const MessageList: React.FC = () => {
  const { userData } = useAuthStore();
  const { messages, isMessagesLoading } = useChatStore();
  const renderMessage = (message: Message) => {
    switch (message.type) {
      case "text":
        return <p>{message.content}</p>;

      case "audio":
        return <AudioMessage audioSrc={message.content} />;

      case "video":
        return <VideoMessage videoSrc={message.content} />;

      default:
        return null;
    }
  };
  const formatDate = (date: string) => {
    const newDate = new Date(date);
    const returnDate = newDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return returnDate;
  };
  if (isMessagesLoading) return <MessageSkeleton />;
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${
            message.senderId === userData.id ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.senderId === userData.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            {renderMessage(message)}
            <div className="text-xs mt-1 opacity-70">
              {formatDate(message.createdAt)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
