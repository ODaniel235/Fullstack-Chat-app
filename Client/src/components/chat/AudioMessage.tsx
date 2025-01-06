import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const AudioMessage = ({ audioSrc }: { audioSrc: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // Progress percentage
  const [currentTime, setCurrentTime] = useState(0); // Current audio time
  const [duration, setDuration] = useState(0); // Total audio duration

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLoadedMetadata = (audio: HTMLAudioElement) => {
    if (audio) {
      console.log(audio.duration);
      // If the duration is still Infinity, continue checking
      if (audio.duration === Infinity) {
        console.log("Duration is still Infinity, checking again...");
        return;
      }
      setDuration(audio.duration);
      console.log("Audio metadata loaded: ", audio.duration); // Debug log for duration
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleAudioEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    // Repeatedly check for duration if it is still Infinity
    /*    const checkDuration = () => {
      if (audio && audio.duration === Infinity) {
        handleLoadedMetadata(audio); // Keep calling handleLoadedMetadata
      }
    }; */

    if (audio && audio.src) {
      // Add event listeners
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", () =>
        console.log("Audio===>", audio.duration)
      );
      audio.addEventListener("ended", handleAudioEnded);

      // Check for duration until it's no longer Infinity
      /*   const interval = setInterval(checkDuration, 100); */ // Check every 100ms

      // Cleanup
      return () => {
        /*         clearInterval(interval);  */ // Clear the interval on component unmount
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", () => console.log());
        audio.removeEventListener("ended", handleAudioEnded);
      };
    }
  }, [audioSrc, audioRef]);

  // Format time into MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="p-2 rounded-full bg-blue-100 dark:bg-blue-900"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-blue-500" />
        ) : (
          <Play className="w-4 h-4 text-blue-500" />
        )}
      </button>

      {/* Progress Bar */}
      <div className="relative w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Time Display */}
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Audio Element */}
      <audio ref={audioRef} src={audioSrc} preload="auto" />
    </div>
  );
};

export default AudioMessage;
