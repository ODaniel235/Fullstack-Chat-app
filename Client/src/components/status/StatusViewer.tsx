import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { statusView } from "../../types";
import useAuthStore from "@/store/useAuthStore";
import useStatusStore from "@/store/useStatusStore";

interface StatusViewerProps {
  statusData: statusView | null;
  onClose: () => void;
  handlePrevious: (isMine?: boolean) => void;
  handleNext: (isMine?: boolean) => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  statusData,
  onClose,
  handlePrevious,
  handleNext,
}) => {
  if (!statusData) return null;

  const { userData } = useAuthStore();
  const { otherStatuses, myStatuses } = useStatusStore();
  const [isMyStatus, setIsMyStatus] = useState<boolean>(
    statusData.userId === userData.id
  );
  const [reply, setReply] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLiked, setIsLiked] = useState<boolean>(statusData.liked || false);
  const [paused, setPaused] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { socket } = useAuthStore();
  const [liked, setLiked] = useState(statusData.likes?.includes(userData.id));

  useEffect(() => {
    const videoElement = videoRef.current;

    const updateProgress = () => {
      if (videoElement && videoDuration > 0) {
        setProgress((videoElement.currentTime / videoDuration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (videoElement) {
        setVideoDuration(videoElement.duration);
      }
    };

    const handleVideoEnded = () => {
      handleNext(isMyStatus);
    };

    if (statusData.type === "video" && videoElement) {
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("timeupdate", updateProgress);
      videoElement.addEventListener("ended", handleVideoEnded);
    } else {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext(isMyStatus);
            return 0;
          }
          return prev + 100 / (30 * 2);
        });
      }, 100 / 2);

      return () => clearInterval(interval);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        videoElement.removeEventListener("timeupdate", updateProgress);
        videoElement.removeEventListener("ended", handleVideoEnded);
      }
    };
  }, [statusData, videoDuration, handleNext, isMyStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const resetInterval = () => setProgress(0);

  const handlePause = (value: boolean) => setPaused(value);

  const handleLike = () => {
    socket.emit("likedStatus", {
      statusId: statusData.id,
      userId: userData.id,
    });
    setLiked((prev) => !prev);
  };

  const handleReply = () => {
    if (reply.trim()) {
      setReply("");
    }
  };

  const statusIndex = otherStatuses.findIndex((s) =>
    s.statuses.some((d) => d.id === statusData?.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg lg:max-w-2xl mx-auto space-y-4 bg-black rounded-xl shadow-lg overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div
            className="h-full bg-blue-500 absolute transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-8 right-4 text-white p-2 rounded-full hover:bg-white/20 transition z-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div
          onMouseOver={() => handlePause(true)}
          onMouseOut={() => handlePause(false)}
          onTouchStart={() => handlePause(true)}
          onTouchEnd={() => handlePause(false)}
          className="relative mt-8 lg:mt-0"
        >
          <p className="text-gray-300 mb-2 text-center text-sm lg:text-base font-medium">
            {isMyStatus
              ? userData.name
              : otherStatuses[statusIndex]?.poster || "Unknown User"}
          </p>
          {statusData.type === "text" ? (
            <div
              className="aspect-video flex items-center justify-center text-2xl lg:text-4xl text-white p-6 lg:p-8 text-center rounded-lg shadow-inner"
              style={{ backgroundColor: statusData.backgroundColor }}
            >
              {statusData.content}
            </div>
          ) : statusData.type === "image" ? (
            <img
              src={statusData.content}
              alt="Status"
              className="w-full max-w-full h-[60vh] object-cover rounded-lg shadow-md transition-transform hover:scale-105"
            />
          ) : (
            <video
              src={statusData.content}
              className="w-full max-w-full h-[80vh] rounded-lg shadow-md"
              autoPlay
              preload="metadata"
              ref={videoRef}
            />
          )}

          <button
            onClick={() => {
              handlePrevious(isMyStatus);
              resetInterval();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/50 hover:bg-white/20 transition shadow-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              handleNext(isMyStatus);
              resetInterval();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/50 hover:bg-white/20 transition shadow-md"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full transition transform active:scale-90 ${
              liked
                ? "text-red-500 bg-red-500/10"
                : "text-white bg-white/10 hover:bg-white/20"
            }`}
          >
            <Heart className="w-6 h-6 active:scale-75 transition-all ease-in-out duration-100" />
          </button>
          <div className="flex-1">
            <input
              onFocus={() => handlePause(true)}
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to status..."
              className="w-full bg-white/10 text-white px-4 py-2 text-sm lg:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleReply}
            className="p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition"
            disabled={!reply.trim()}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Views and Likes */}
        <div className="mt-4 text-white text-sm lg:text-base text-center lg:text-left">
          <p>
            {isMyStatus &&
              `${statusData?.views?.length || 0} views · ${
                statusData?.likes?.length || 0
              }  
            likes`}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
