import { Play, Pause } from "lucide-react"; // Assuming you're using Play and Pause icons for the play button
import React from "react";

const VideoMessage = ({ videoSrc }: { videoSrc: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isBlur, setIsBlur] = React.useState(false);
  const togglePlayPause = () => {
    console.log(videoSrc);
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(false);
        setIsBlur(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsBlur(false);
      }
    }
  };

  return (
    <div className="relative">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={videoSrc}
          controls
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause button overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause
              className={` ${
                isBlur && "opacity-0"
              } transition-all ease-in-out duration-200 w-12 h-12 text-white`}
            />
          ) : (
            <Play
              className={` ${
                isBlur && "opacity-0"
              } transition-all ease-in-out duration-200 w-12 h-12 text-white`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoMessage;
