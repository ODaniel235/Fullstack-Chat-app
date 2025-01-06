import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Pause, Play, X } from "lucide-react";

interface VideoRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (videoBlob: Blob, cleanUp: Function) => void;
}

export const VideoRecordingModal: React.FC<VideoRecordingModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
          }

          const mediaRecorder = new MediaRecorder(mediaStream);
          mediaRecorderRef.current = mediaRecorder;
          videoChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              videoChunksRef.current.push(event.data);
            }
          };
        })
        .catch((error) => console.error("Error accessing camera:", error));
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isOpen]);

  const handleRecordToggle = () => {
    if (!isRecording) {
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, {
          type: "video/webm",
        });
        onSend(videoBlob, cleanUp);
        onClose();
      };
    } else {
      cleanUp();
      onClose();
    }
  };

  const handleClose = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    }
    cleanUp();
    onClose();
  };
  const cleanUp = () => {
    setIsRecording(false);
    setDuration(0);
    videoChunksRef.current = [];
    mediaRecorderRef.current = null;
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
              {isRecording && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-red-500 text-white rounded-lg text-sm">
                  {Math.floor(duration / 60)}:
                  {(duration % 60).toString().padStart(2, "0")}
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleClose}
                className="p-4 bg-red-500 text-white rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={handleRecordToggle}
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
