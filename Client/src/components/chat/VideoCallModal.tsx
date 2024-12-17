import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  Users,
} from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      // Auto-end call after 15 seconds
      setTimeout(() => {
        onClose();
      }, 15000);

      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // TODO: Implement actual video call functionality
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }

    if (!isOpen) {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black flex flex-col z-50"
        >
          <div className="flex-1 relative">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 right-4 w-48 aspect-video bg-gray-900 rounded-lg overflow-hidden"
            >
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
            </motion.div>
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white">
              {Math.floor(duration / 60)}:
              {(duration % 60).toString().padStart(2, "0")}
            </div>
          </div>

          <div className="bg-gray-900 p-4 absolute bottom-0 w-screen">
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-2 md:p-4 rounded-full ${
                  isAudioEnabled ? "bg-gray-700" : "bg-red-500"
                }`}
              >
                {isAudioEnabled ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-4 md:p-6 bg-red-500 rounded-full"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`p-2 md:p-4 rounded-full ${
                  isVideoEnabled ? "bg-gray-700" : "bg-red-500"
                }`}
              >
                {isVideoEnabled ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-2 md:p-4 rounded-full ${
                  isScreenSharing ? "bg-blue-500" : "bg-gray-700"
                }`}
              >
                <MonitorUp className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
