import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Phone } from "lucide-react";
import dial from "../../assets/sounds/dial.mp3";
import useCallStore from "@/store/useCallStore";

export const CallModal: React.FC = () => {
  const {
    inCall,
    incomingCall,
    incomingCallData,
    callData,
    callerData,
    answerCall,
    remoteStream,
  } = useCallStore();

  const [status, setStatus] = useState<
    "outgoing" | "connected" | "incoming" | null
  >(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(dial);
    audioRef.current.loop = true;
  }, []);

  useEffect(() => {
    if (incomingCall && incomingCallData.type === "audio") {
      setStatus("incoming");
    } else if (callData?.initiator && status !== "connected") {
      setStatus("outgoing");
    }
  }, [incomingCall, incomingCallData, callData, status]);

  useEffect(() => {
    if (remoteStream) {
      audioRef.current = null;
      console.log("Remote stream received===>", remoteStream);
      return;
    }
    if (status === "outgoing" || status === "incoming") {
      console.log("Playing ringtone...");
      audioRef.current
        ?.play()
        .catch((error) => console.error("Audio playback failed:", error));
    } else {
      console.log("Pausing ringtone...");
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;
    }
  }, [status]);

  const endCall = () => {
    setDuration(0);
    audioRef.current?.pause();
    setStatus(null);
  };
  const acceptCall = () => {
    console.log("Signal====>", incomingCallData);
    answerCall(incomingCallData.signal);
  };
  return (
    <AnimatePresence>
      {status && (
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
              src={callerData?.avatar}
              alt={callerData?.name}
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">
              {callerData?.name}
            </h2>
            <p className="text-gray-300 mb-8">
              {status === "outgoing"
                ? "Ringing..."
                : status == "incoming"
                ? "Incoming Call"
                : `${Math.floor(duration / 60)}:${(duration % 60)
                    .toString()
                    .padStart(2, "0")}`}
            </p>
            <div className="flex justify-center items-center space-x-6">
              {status === "incoming" ? (
                <>
                  <button
                    onClick={acceptCall}
                    className="p-4 bg-green-500 text-white rounded-full"
                  >
                    <Phone className="w-6 h-6" />
                  </button>{" "}
                  <button
                    onClick={endCall}
                    className="p-4 bg-red-500 text-white rounded-full"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </>
              ) : status == "connected" ? (
                <>
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
                </>
              ) : (
                <button
                  onClick={endCall}
                  className="p-4 bg-red-500 text-white rounded-full"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
