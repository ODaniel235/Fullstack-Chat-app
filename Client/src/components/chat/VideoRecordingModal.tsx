import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Send, Pause, Play, X } from "lucide-react";

interface VideoRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (videoBlob: Blob) => void;
}

export const VideoRecordingModal: React.FC<VideoRecordingModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isOpen) {
      // TODO: Implement actual video recording
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }
    if (!isOpen) {
      setDuration(0);
      setIsRecording(false);
    }
  }, [isOpen]);

  const handleSend = () => {
    // TODO: Implement actual video recording
    const dummyBlob = new Blob([], { type: "video/webm" });
    onSend(dummyBlob);
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
          <div className="w-full max-w-2xl p-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ opacity: isRecording ? 1 : 0 }}
                  className="px-2 py-1 bg-red-500 text-white rounded-lg text-sm"
                >
                  {Math.floor(duration / 60)}:
                  {(duration % 60).toString().padStart(2, "0")}
                </motion.div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                className="p-4 bg-red-500 text-white rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className="p-4 bg-blue-500 text-white rounded-full"
              >
                {isRecording ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={handleSend}
                className="p-4 bg-green-500 text-white rounded-full"
                disabled={!isRecording && duration === 0}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
