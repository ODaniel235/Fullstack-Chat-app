import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Pause, MicOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (audioBlob: Blob, wipe: Function) => void;
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRecording) {
      startRecording();
      const interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 256; // Control resolution
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
          setAudioBlob(blob);
        };

        mediaRecorderRef.current.start();
        visualizeWaveform();
      })
      .catch(() => {
        toast({
          description:
            "Could not access your microphone. Please check your settings.",
          variant: "destructive",
        });
      });
  };

  const visualizeWaveform = () => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!analyser || !dataArray) return;

    const renderWaveform = () => {
      analyser.getByteTimeDomainData(dataArray);
      const normalizedData = Array.from(dataArray).map(
        (value) => (value / 128 - 1) * 100
      );
      setWaveform(normalizedData);
      animationFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();
  };

  const stopRecording = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    mediaRecorderRef.current?.stop();
    audioContextRef.current?.close();
    cleanup();
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, wipe);
    }
  };
  const wipe = () => {
    setWaveform([]);
    setDuration(0);
    setAudioBlob(null);
    setIsRecording(false);

    setDuration(0);
    setAudioBlob(null);
    onClose();
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setIsRecording((prev) => !prev);
                  console.log("Clicked");
                }}
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

            <button
              onClick={wipe}
              className="p-3 bg-red-500 text-white rounded-full"
              disabled={!isRecording}
            >
              <MicOff className="w-6 h-6" />
            </button>

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

          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full flex items-center justify-around">
              {waveform.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.abs(height)}%` }}
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
