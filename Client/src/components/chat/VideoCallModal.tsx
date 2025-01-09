import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
} from "lucide-react";
import useCallStore from "@/store/useCallStore";



export const VideoCallModal: React.FC = () => {
  const {
    inCall,
    incomingCall,
    incomingCallData,
    stream,
    remoteStream,
    initiateCall,
    callData,
    answerCall,
    wipeCallData,
    setStream,
    peer,
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Attach local stream to the local video element
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // Attach remote stream to the remote video element
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [stream, remoteStream]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inCall) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [inCall]);

  const handleToggleAudio = () => {
    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isAudioEnabled));
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleToggleVideo = () => {
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing and switch back to camera
      const tracks = stream?.getVideoTracks();
      if (tracks?.length > 0) {
        const [cameraTrack] = await navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((s) => s.getVideoTracks());
        peer?.replaceTrack(tracks[0], cameraTrack, stream!);
        stream.removeTrack(tracks[0]);
        stream.addTrack(cameraTrack);
        setStream(stream);
      }
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const [screenTrack] = screenStream.getVideoTracks();
        peer?.replaceTrack(stream?.getVideoTracks()[0], screenTrack, stream!);
        stream?.removeTrack(stream.getVideoTracks()[0]);
        stream?.addTrack(screenTrack);
        setStream(stream);
        setIsScreenSharing(true);

        screenTrack.onended = () => {
          handleScreenSharing(); // Automatically revert back when sharing stops
        };
      } catch (error) {
        console.error("Screen sharing error:", error);
      }
    }
  };

  const handleEndCall = () => {
    wipeCallData();

  };

  const handleAnswerCall = () => {
    if (incomingCall && incomingCallData?.signal) {
      answerCall(incomingCallData.signal);
    }
  };
  /* 
  useEffect(() => {
    if (incomingCall) {
      handleAnswerCall();
    }
  }, [incomingCall]);
 */
  return (
    <AnimatePresence>
      {(incomingCall && incomingCallData.type == "video") ||
      (inCall && callData.type == "video") ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black flex flex-col z-50"
        >
          {/* Remote Video */}
          <div className="flex-1 relative">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Local Video */}
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
                muted
              />
            </motion.div>
            {/* Call Duration */}
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white">
              {Math.floor(duration / 60)}:
              {(duration % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* Call Controls */}
          <div className="bg-gray-900 p-4 absolute bottom-0 w-screen">
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={handleToggleAudio}
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
                onClick={handleEndCall}
                className="p-4 md:p-6 bg-red-500 rounded-full"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={handleToggleVideo}
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
                onClick={handleScreenSharing}
                className={`p-2 md:p-4 rounded-full ${
                  isScreenSharing ? "bg-blue-500" : "bg-gray-700"
                }`}
              >
                <MonitorUp className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
