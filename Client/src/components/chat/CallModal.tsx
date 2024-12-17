import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff } from "lucide-react";
import dial from "../../assets/sounds/dial.mp3";
interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatar: string;
  } | null;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [status, setStatus] = useState<"ringing" | "connected" | null>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const newAudio = new Audio(dial);
  useEffect(() => {
    if (status == "ringing") {
      newAudio.play();
    } else {
      newAudio.pause();
    }
  }, [status]);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (isOpen) {
      setStatus("ringing");
      // Auto-connect after 2 seconds
      timeout = setTimeout(() => {
        setStatus("connected");
      }, 20000);

      // Auto-end call after 15 seconds
      timeout = setTimeout(() => {
        onClose();
      }, 15000);

      // Update duration when connected
      if (status === "connected") {
        interval = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      }
    }

    if (!isOpen) {
      setDuration(0);
    }
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isOpen, status, onClose]);
  const endCall = () => {
    setDuration(0);
    newAudio.pause();
    setStatus(null);
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        >
          <div className="w-full max-w-md p-6 text-center">
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={user.avatar}
              alt={user.name}
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
            <p className="text-gray-300 mb-8">
              {status === "ringing"
                ? "Ringing..."
                : `${Math.floor(duration / 60)}:${(duration % 60)
                    .toString()
                    .padStart(2, "0")}`}
            </p>

            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full ${
                  isMuted ? "bg-red-500" : "bg-gray-600"
                } text-white`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={endCall}
                className="p-6 bg-red-500 text-white rounded-full"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-full ${
                  isSpeakerOn ? "bg-blue-500" : "bg-gray-600"
                } text-white`}
              >
                {isSpeakerOn ? (
                  <Volume2 className="w-6 h-6" />
                ) : (
                  <VolumeX className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
