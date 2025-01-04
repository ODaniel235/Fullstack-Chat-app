import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Message } from "../../types";
import VideoMessage from "./VideoMessage";
import AudioMessage from "./AudioMessage";
import useAuthStore from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import formatDate from "@/utils/formatDate";

export const MessageList: React.FC = () => {
  const { userData } = useAuthStore();
  const { messages, isMessagesLoading, selectedChat } = useChatStore();
  const [showStartChat, setShowStartChat] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isMessagesLoading) return;
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesLoading]);
  useEffect(() => {
    if (!isMessagesLoading && messages.length === 0) {
      const timer = setTimeout(() => {
        setShowStartChat(true);
      }, 3000); // Show "Start chat" after 3 seconds

      return () => clearTimeout(timer); // Cleanup on unmount or dependency change
    } else {
      setShowStartChat(false); // Reset if messages arrive
    }
  }, [isMessagesLoading, messages]);

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

  if (isMessagesLoading) return <MessageSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length > 0
        ? messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.senderId === userData.id
                    ? "justify-end"
                    : "justify-start"
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
                  {/* Show "seen" for the last message if it's read */}
                  {isLastMessage &&
                    selectedChat.lastMessage.isRead &&
                    message.senderId == userData.id && (
                      <div className="text-right text-xs text-white mt-1">
                        Seen
                      </div>
                    )}
                </div>
              </motion.div>
            );
          })
        : showStartChat && (
            <div className="text-center text-gray-500 mt-4">
              Start a chat to see messages here.
            </div>
          )}
      {/* Message end ref should be on the last element */}
      <div ref={messageEndRef} />
    </div>
  );
};
