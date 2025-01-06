import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Pause, MicOff, X, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (audioBlob: Blob, wipeBlob: any) => void;
}

export const AudioRecordingModal: React.FC<AudioRecordingModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();
  const audioPlayer = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
        setWaveform((prev) => [...prev, Math.random() * 100]); // Simulated waveform
      }, 500);

      // Clean up interval
      return () => clearInterval(interval);
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];
        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };
        mediaRecorder.current.onstop = () => {
          const blob = new Blob(audioChunks.current, { type: "audio/mp3" });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
        };
        mediaRecorder.current.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
        toast({
          description:
            "Could not access your microphone. Please check your settings",
          variant: "destructive",
        });
      });
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    cleanup();
  };

  const handleSend = async () => {
    if (audioBlob) {
      console.log(audioBlob);
      onSend(audioBlob, cleanup);
      cleanup();

      onClose();
    }
  };

  const cleanup = () => {
    setWaveform([]);
    setIsRecording(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 p-4 rounded-t-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            {/* Recording Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-full ${
                  isRecording ? "bg-red-500" : "bg-blue-500"
                } text-white`}
              >
                {isRecording ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <span className="text-lg font-semibold">
                {Math.floor(duration / 60)}:
                {(duration % 60).toString().padStart(2, "0")}
              </span>
            </div>

            {/* Stop Recording */}
            {duration > 0 && (
              <button
                onClick={stopRecording}
                className="p-3 bg-red-500 text-white rounded-full"
              >
                <MicOff className="w-6 h-6" />
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={audioBlob ? handleSend : onClose}
              className={`p-3 ${
                audioBlob ? "bg-blue-500" : "bg-red-500"
              } text-white rounded-full`}
            >
              {audioBlob ? (
                <Send className="w-6 h-6" />
              ) : (
                <X className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Waveform */}
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full flex items-center justify-around">
              {waveform.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  className="w-1 bg-blue-500 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
