import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
/* import { useStore } from "../../store/useStore";
import { Status } from "../../types"; */
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
  if (statusData == null) return;
  const { userData } = useAuthStore();
  const { otherStatuses, myStatuses } = useStatusStore();
  const [isMyStatus, setIsMyStatus] = useState<boolean>(
    statusData.userId == userData.id
  );
  const [reply, setReply] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0); // Track video duration in seconds
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { socket } = useAuthStore();
  const modalRef = useRef<HTMLDivElement>(null); // Create a ref for the modal container
  const [isLiked, setIsLiked] = useState<boolean>(statusData.liked || false);
  const [paused, setPaused] = useState<boolean>(false);
  if (!statusData) return;
  useEffect(() => {
    if (!statusData) return;
    setCurrentIndex(
      otherStatuses.findIndex((s) => s.userId == statusData.userId)
    );
    if (paused) return; // Skip setting up the interval if paused
    const videoElement = videoRef.current;
    if (statusData.type === "video") {
      // Video-specific logic
      const updateProgress = () => {
        if (videoElement && videoDuration > 0) {
          const currentTime = videoElement.currentTime;
          setProgress((currentTime / videoDuration) * 100); // Calculate progress percentage
        }
      };

      const handleLoadedMetadata = () => {
        if (videoElement) {
          setVideoDuration(videoElement.duration); // Get video duration
        }
      };

      const handleVideoEnded = () => {
        handleNext(); // Automatically go to the next status when the video ends
      };

      // Add event listeners
      videoElement?.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement?.addEventListener("timeupdate", updateProgress);
      videoElement?.addEventListener("ended", handleVideoEnded);

      // Cleanup listeners on unmount or when statusData changes
      return () => {
        videoElement?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        videoElement?.removeEventListener("timeupdate", updateProgress);
        videoElement?.removeEventListener("ended", handleVideoEnded);
      };
    } else {
      // Non-video-specific logic (progress bar for static statuses)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Handle progress completion for non-video statuses
            if (isMyStatus) {
              const statusIndex = myStatuses.statuses.findIndex(
                (s) => s.id === statusData.id
              );
              console.log(statusIndex, myStatuses.statuses.length);
              if (statusIndex < myStatuses.statuses.length - 1) {
                setCurrentIndex((prevIndex) => prevIndex + 1);
                handleNext(statusData.userId === userData.id);
                return 0;
              } else {
                console.log("Closing1");
                onClose();
                clearInterval(interval);
                return prev;
              }
            } else {
              if (currentIndex < otherStatuses?.length) {
                setCurrentIndex((prevIndex) => prevIndex + 1);
                handleNext(statusData.userId === userData.id);
                return 0;
              } else {
                onClose();
                clearInterval(interval);
                return prev;
              }
            }
          }
          return prev + 100 / (30 * 2); // Increment progress over 30 seconds
        });
      }, 100 / 2);

      // Cleanup interval on unmount or when statusData changes
      return () => clearInterval(interval);
    }
  }, [
    statusData,
    isMyStatus,
    currentIndex,
    otherStatuses.length,
    handleNext,
    onClose,
  ]);

  const resetInterval = () => {
    setProgress(0);
  };
  // Function to toggle the paused state
  const handlePause = (value: boolean) => setPaused(value);
  // Close the modal if clicked outside
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

  if (!statusData) return null;

  const handleLike = () => {
    socket.emit("likedStatus", { id: statusData.id });
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    /*     replyToStatus(currentStatus.id, reply); */
    setReply("");
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
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div
            className="h-full bg-blue-500 absolute transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-4 text-white p-2 rounded-full hover:bg-white/20 transition z-50"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Status Content */}
        <div
          onMouseOver={() => {
            const isDesktop = window.innerWidth > 780;
            handlePause(isDesktop);
          }}
          onMouseOut={() => {
            const isDesktop = window.innerWidth > 780;
            handlePause(!isDesktop);
          }}
          onTouchStart={() => handlePause(true)}
          onTouchEnd={() => handlePause(false)}
          className="relative mt-8 lg:mt-0 "
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
              className="w-full max-w-full h-auto rounded-lg shadow-md"
              autoPlay
              loop
            />
          )}

          {/* Navigation Buttons */}
          <button
            onClick={() => {
              handlePrevious(statusData.userId === userData.id); // Trigger the previous function regardless of screen size
              resetInterval(); // Reset the interval on click
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/50 hover:bg-white/20 transition shadow-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              handleNext(statusData.userId === userData.id); // Trigger the next function regardless of screen size
              resetInterval(); // Reset the interval on click
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/50 h-fill hover:bg-white/20 transition shadow-md"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Interaction Section */}
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full transition transform active:scale-90 ${
              isLiked
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
