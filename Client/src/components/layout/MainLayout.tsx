import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { useCallStore } from "../../store/useStore";
import { VideoCallModal } from "../chat/VideoCallModal";
import { CallModal } from "../chat/CallModal";
import { useStore } from "zustand";
export const MainLayout: React.FC = () => {
  const {
    callType,
    endCall,
    inCall,
  
    userData,
  } = useCallStore();
  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <motion.main
        className="flex-1 overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />

        <VideoCallModal
          isOpen={inCall && callType == "video"}
          onClose={endCall}
        />
        <CallModal
          isOpen={inCall && callType == "audio"}
          onClose={endCall}
          user={userData}
        />
      </motion.main>
    </div>
  );
};
