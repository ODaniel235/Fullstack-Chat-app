import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Message, Chat } from "../../types"; // Assuming `Message` and `Chat` types are already defined
import VideoMessage from "../chat/VideoMessage";
import AudioMessage from "../chat/AudioMessage";
import formatDate from "@/utils/formatDate";

interface GroupChatMessageListProps {
  messages: any;
  currentUserId: string;
}

const GroupChatMessageList: React.FC<GroupChatMessageListProps> = ({
  messages,

  currentUserId,
}) => {
  const [showStartChat, setShowStartChat] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setShowStartChat(true);
      }, 1000); // Show "Start chat" after 3 seconds

      return () => clearTimeout(timer); // Cleanup on unmount or dependency change
    } else {
      setShowStartChat(false); // Reset if messages arrive
    }
  }, [messages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderMessage = (message: Message) => {
    let type = message.type || "text";
    switch (type) {
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages && messages.length > 0
        ? messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isCurrentUser = message.senderId === currentUserId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  {/* Display sender's name if the message is not sent by the current user */}
                  {!isCurrentUser && (
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      {message.sender.name}
                    </div>
                  )}
                  {renderMessage(message)}
                  <div className="text-xs mt-1 opacity-70">
                    {formatDate(message.createdAt)}
                  </div>
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

export default GroupChatMessageList;
