import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { sampleChats } from "../data/sampleData";
import { formatDistanceToNow } from "../utils/dateUtils";
import useChatStore from "@/store/useChatStore";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";

export const ChatList: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const chats = useChatStore((state) => state.chats);

  const { setActiveChat } = useStore();
  const { fetchConversation } = useChatStore();
  const { userData } = useAuthStore();
  useEffect(() => {
    const fetchConvo = async () => {
      await fetchConversation(toast);
    };
    fetchConvo();
  }, []);
  useEffect(() => {
    console.log("Chats updated:", chats);
  }, [chats]);
  console.log("Chats==>", chats);
  const handleChatClick = (chatId: string) => {
    setActiveChat(chatId);
    console.log(chatId);
    navigate(`/chat/${chatId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col overflow-x-hidden"
    >
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <input
          type="search"
          placeholder="Search chats..."
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
          <div className="divide-y dark:divide-gray-700">
            {chats.map((chat) => {
              const otherParticipant = chat?.participants?.filter(
                (p) => p.id !== userData.id
              );
              console.log("Participant==>", otherParticipant);
              const lastMessage = chat.lastMessage;
              console.log("Id===>", userData.id);
              return (
                <motion.div
                  key={chat.id}
                  onClick={() => {
                    handleChatClick(chat.id);
                  }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={otherParticipant?.avatar}
                      alt={otherParticipant?.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">
                          {otherParticipant?.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(chat?.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage
                          ? lastMessage.type === "text"
                            ? lastMessage.content
                            : `Sent a ${lastMessage.type}`
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to ChatApp</h2>
              <p className="text-gray-500">
                Start a new conversation to begin chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
