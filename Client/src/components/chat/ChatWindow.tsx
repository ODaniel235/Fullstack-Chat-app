import React, { useEffect, useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Video, Phone, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCallStore from "@/store/useCallStore";
import { AudioRecordingModal } from "./AudioRecordingModal";
import { VideoRecordingModal } from "./VideoRecordingModal";
import useChatStore from "@/store/useChatStore";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import Avatar from "../shared/Avatar";
export const ChatWindow: React.FC = () => {
  const { toast } = useToast();
  const { inCall, incomingCall, initiateCall } = useCallStore();

  const {
    selectedChat,
    messages,
    handleMessage,
    fetchMessages,
    handleSpecialChatSend,
  } = useChatStore();
  const { userData, socket } = useAuthStore();
  const [isRecording, setIsRecording] = useState({
    type: "null",
    value: true,
  });
  const navigate = useNavigate();
  const participantData =
    selectedChat?.participants?.filter((p) => p.id !== userData.id)[0] ||
    selectedChat;

  useEffect(() => {
    console.log(participantData);
    if (!participantData || participantData.length < 1) {
      navigate("/chats");
      return;
    }
    fetchMessages(participantData.id, toast, navigate);
  }, [participantData]);
  useEffect(() => {
    if (!selectedChat) {
      navigate("/");
      return;
    }
    console.log(selectedChat);
    if (!selectedChat.id || !userData.id) return;
    if (
      !selectedChat.lastMessage ||
      selectedChat?.lastMessage.senderId == userData.id
    )
      return;
    socket.emit("markMessageAsRead", {
      id: selectedChat.id,
      userId: userData.id,
    });
  }, [selectedChat, messages]);
  

  const record = (type: string) => {
    setIsRecording({ value: true, type: type });
  };

  const handleSpecialSend = async (
    blob: Blob,
    wipeBlob: Function,
    folder: string
  ) => {
    await handleSpecialChatSend(
      blob,
      wipeBlob,
      toast,
      participantData.id,
      folder
    );
  };
  const startCall = async () => {
    toast({
      description:
        "Function not yet added, please use the voice or audio message function instead",
    });
  };
  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-800">
        <div
          onClick={() => {
            navigate(`/user/${participantData?.id}`);
          }}
          className="flex items-center space-x-3"
        >
          {participantData && (
            <Avatar
              avatar={participantData?.avatar}
              alt="contact"
              name={participantData.name || "Unknown"}
            />
          )}

          <div>
            <h2 className="font-semibold">{participantData?.name}</h2>
            <p className="text-sm text-gray-500">{participantData?.status}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* TODO: Implement audio call functionality */}
          <button
            disabled={incomingCall || inCall}
            onClick={startCall}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <Phone className="w-5 h-5" />
          </button>
          {/* TODO: Implement video call functionality */}
          <button
            disabled={incomingCall || inCall}
            onClick={startCall}
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
        onSend={(audioBlob, wipeBlob) =>
          handleSpecialSend(audioBlob, wipeBlob, "audio")
        }
      />
      <VideoRecordingModal
        isOpen={isRecording.value && isRecording.type == "video"}
        onClose={() => setIsRecording({ type: "null", value: false })}
        onSend={(videoBlob, wipe) =>
          handleSpecialSend(videoBlob, wipe, "video")
        }
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
          <MessageInput participantId={participantData.id} />
        </div>
      </div>
    </div>
  );
};
