import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { UserProfileHeader } from "../components/user/UserProfileHeader";
import { UserProfileInfo } from "../components/user/UserProfileInfo";
import { CallModal } from "../components/chat/CallModal";
import { VideoCallModal } from "../components/chat/VideoCallModal";
import useChatStore from "@/store/useChatStore";
import { useToast } from "@/hooks/use-toast";

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  console.log(location);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const { userSearch } = useChatStore();
  const { handleChatClick } = useChatStore();
  console.log("Search ===>", userSearch);
  if (!userSearch) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "User not found, please try searching again",
    });
    navigate("/chats");
    return null;
  }

  const handleMessage = () => {
    handleChatClick("new", userSearch);

    navigate(`/chat/new`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-auto bg-gray-50 dark:bg-gray-900"
    >
      <UserProfileHeader
        user={userSearch}
        onMessage={handleMessage}
        onAudioCall={() => setShowCallModal(true)}
        onVideoCall={() => setShowVideoCallModal(true)}
      />

      <div className="max-w-3xl mx-auto -mt-8">
        <UserProfileInfo user={userSearch} />
      </div>

      <CallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        user={userSearch}
        type="audio"
      />

      <VideoCallModal
        isOpen={showVideoCallModal}
        onClose={() => setShowVideoCallModal(false)}
        user={userSearch}
      />
    </motion.div>
  );
};
