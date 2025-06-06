import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { formatDistanceToNow } from "../utils/dateUtils";
import useChatStore from "@/store/useChatStore";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { Plus } from "lucide-react";
import { JoinGroupModal } from "@/components/groups/JoinGroupModal";
import Avatar from "@/components/shared/Avatar";

export const ChatList: React.FC = () => {
  const { fetchUser } = useChatStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { chats } = useChatStore();
  const [mappedChats, setMappedChats] = useState([...chats]);

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
  const handleSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const onClose = () => setShowJoinModal(false);
    await fetchUser(onClose, id, toast, navigate, e);
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
                    <Avatar
                      avatar={otherParticipant?.avatar}
                      alt="group"
                      name={otherParticipant.name}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">
                          {otherParticipant.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(chat?.updatedAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm  truncate ${
                          !chat.lastMessage.isRead &&
                          chat.lastMessage.senderId !== userData.id
                            ? "font-bold text-white"
                            : "text-gray-500"
                        }`}
                      >
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
        handleSubmit={(e, id: string) => handleSubmit(e, id)}
        group={false}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </motion.div>
  );
};
