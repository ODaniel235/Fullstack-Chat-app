import React, { useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Video, Phone, Mic } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { sampleChats } from "../../data";
import { useCallStore, useStore } from "../../store/useStore";
import { AudioRecordingModal } from "./AudioRecordingModal";
import { VideoRecordingModal } from "./VideoRecordingModal";
export const ChatWindow: React.FC = () => {
  const { setCall, inCall } = useCallStore();
  const { currentUser } = useStore();
  const [isRecording, setIsRecording] = useState({
    type: "null",
    value: true,
  });
  const { chatId } = useParams();
  const navigate = useNavigate();
  const findChat = sampleChats.find((p) => (p = chatId));
  const participantData = findChat.participants[1];
  const startCall = (type: string) => {
    if (type == "video") {
      setCall(
        participantData,
        "video",
        currentUser?.id,
        participantData?.id,
        "random",
        "outgoing"
      );
    } else {
      setCall(
        participantData,
        "audio",
        currentUser?.id,
        participantData?.id,
        "random",
        "outgoing"
      );
    }
  };
  const record = (type: string) => {
    setIsRecording({ value: true, type: type });
  };
  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <img
            onClick={() => navigate(`/user/${participantData?.id}`)}
            src={participantData?.avatar}
            alt="Contact"
            className="w-10 h-10 rounded-full hover:cursor-pointer"
          />
          <div>
            <h2 className="font-semibold">{participantData?.name}</h2>
            <p className="text-sm text-gray-500">{participantData?.status}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* TODO: Implement audio call functionality */}
          <button
            disabled={inCall}
            onClick={() => startCall("audio")}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <Phone className="w-5 h-5" />
          </button>
          {/* TODO: Implement video call functionality */}
          <button
            disabled={inCall}
            onClick={() => startCall("video")}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList />
      <AudioRecordingModal
        isOpen={isRecording.value && isRecording.type == "audio"}
        onClose={() => setIsRecording({ type: "null", value: false })}
        onSend={() => console.log("Sent")}
      />
      <VideoRecordingModal
        isOpen={isRecording.value && isRecording.type == "video"}
        onClose={() => setIsRecording({ type: "null", value: false })}
        onSend={() => console.log("Sent")}
      />
      {/* Message Input Area */}
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <div className="flex space-x-2">
          {/* TODO: Implement audio recording */}
          <button
            disabled={inCall}
            onClick={() => record("audio")}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <Mic className="w-5 h-5" />
          </button>
          {/* TODO: Implement video recording */}
          <button
            disabled={inCall}
            onClick={() => record("video")}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <Video className="w-5 h-5" />
          </button>
          <MessageInput />
        </div>
      </div>
    </div>
  );
};
