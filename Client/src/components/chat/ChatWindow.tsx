import React, { useEffect, useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Video, Phone, Mic } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { sampleChats } from "../../data";
import { useCallStore, useStore } from "../../store/useStore";
import { AudioRecordingModal } from "./AudioRecordingModal";
import { VideoRecordingModal } from "./VideoRecordingModal";
import useChatStore from "@/store/useChatStore";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
export const ChatWindow: React.FC = () => {
  const { toast } = useToast();
  const { setCall, inCall } = useCallStore();
  const { currentUser } = useStore();

  const { selectedChat, messages, handleMessage, fetchMessages } =
    useChatStore();
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
    if (!participantData) {
      navigate("/chats");
      return;
    }
    fetchMessages(participantData.id, toast, navigate).catch((err) => {
      console.error("Error fetching messages:", err);
      navigate("/chats");
    });
  }, [participantData]);
  useEffect(() => {
    if (!selectedChat) {
      navigate("/");
      return;
    }
    console.log(selectedChat);
    if (!selectedChat.id || !userData.id) return;
    console.log("Selected====>", selectedChat);
    if (
      !selectedChat.lastMessage ||
      selectedChat?.lastMessage.senderId == userData.id
    )
      return;
    socket.emit("markMessageAsRead", {
      id: selectedChat.id,
      userId: userData.id,
    });
    console.log("Emmitted event");
  }, [selectedChat, messages]);
  console.log(participantData);
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
  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Read the Blob as Base64
    });

  const handleAudioSend = async (audioBlob: any, wipeBlob: any) => {
    /*     const reader = new FileReader();
    //Will be pushing to cloudinary from here to reduce payload to backend
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1]; // Get base64 string from data URL
      console.log(base64String);
    };
    reader.readAsDataURL(audioBlob); // Read the Blob as a Data URL */
    const data = await blobToBase64(audioBlob);
    await handleMessage(
      "audio",
      participantData.id,
      data,
      toast,
      wipeBlob
    ).catch((err) => console.log(err));
  };
  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <img
            onClick={() => {
              navigate(`/user/${participantData?.id}`);
            }}
            src={
              participantData?.avatar ||
              "https://res.cloudinary.com/dvtuuqtdb/image/upload/v1719960554/images/ryjefb8seoqbaizc7fc3.jpg"
            }
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
        onSend={(audioBlob, wipeBlob) => handleAudioSend(audioBlob, wipeBlob)}
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
          <MessageInput participantId={participantData.id} />
        </div>
      </div>
    </div>
  );
};
