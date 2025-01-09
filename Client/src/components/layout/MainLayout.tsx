import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { VideoCallModal } from "../chat/VideoCallModal";
import { CallModal } from "../chat/CallModal";
export const MainLayout: React.FC = () => {
  // Request notification permission
  const requestNotificationPermission = async () => {
    if (Notification.permission === "granted") return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.error("Notification permission denied");
    }
  };
  useEffect(() => {
    requestNotificationPermission();
  }, []);
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

        <VideoCallModal />
        <CallModal />
      </motion.main>
    </div>
  );
};
