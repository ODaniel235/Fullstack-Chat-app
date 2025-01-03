import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { formatDistanceToNow } from "../utils/dateUtils";
import useChatStore from "@/store/useChatStore";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { Plus } from "lucide-react";
import { JoinGroupModal } from "@/components/groups/JoinGroupModal";

export const ChatList: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { chats } = useChatStore();
  const [mappedChats, setMappedChats] = useState([...chats]);
  const { setActiveChat } = useStore();
  const { fetchConversation, handleChatClick } = useChatStore();
  const { userData } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  useEffect(() => {
    const fetchConvo = async () => {
      await fetchConversation(toast);
    };
    fetchConvo();
  }, []);
  useEffect(() => {
    setMappedChats(chats);
  }, [chats]);
  const handleClick = (chatId: string) => {
    setActiveChat(chatId);
    handleChatClick(chatId);
    navigate(`/chat/${chatId}`);
  };

  const filterChats = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();

    // Filter conversations where any participantmatch query
    const matchingConversations = chats.filter((chat: any) =>
      chat.participants.some(
        (participant: any) =>
          participant.id !== userData.id && // Exclude the current user
          participant.name.toLowerCase().includes(query) // Match query
      )
    );

    setMappedChats(matchingConversations); // Update state with filtered conversations
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
          onChange={filterChats}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
          <div className="divide-y dark:divide-gray-700">
            {mappedChats.map((chat: any) => {
              const otherParticipant = chat?.participants?.filter(
                (p) => p.id !== userData.id
              )[0];
              const lastMessage = chat.lastMessage;
              return (
                <motion.div
                  key={chat.id}
                  onClick={() => {
                    handleClick(chat.id);
                  }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center space-x-3">
                    {otherParticipant.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name || "User Avatar"}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl bg-blue-600">
                        {otherParticipant.name?.substring(0, 1)?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">
                          {otherParticipant.name}
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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowJoinModal(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
      <JoinGroupModal
        group={false}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </motion.div>
  );
};
