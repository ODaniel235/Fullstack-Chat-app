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
  } = useCallStore();

  const [status, setStatus] = useState<
    "outgoing" | "connected" | "incoming" | null
  >(null);
  const [duration, setDuration] = useState(0);

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
            <h2 className="text-2xl font-bold text-white mb-2">
              {callerData?.name}
            </h2>
            <p className="text-gray-300 mb-8">
              {status === "outgoing" ? "Ringing..." : "Incoming Call..."}
            </p>
            <div className="flex justify-center items-center space-x-6">
              {status === "incoming" && (
                <>
                  <button
                    onClick={acceptCall}
                    className="p-4 bg-green-500 text-white rounded-full"
                  >
                    <Phone className="w-6 h-6" />
                  </button>
                  <button
                    onClick={endCall}
                    className="p-4 bg-red-500 text-white rounded-full"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
