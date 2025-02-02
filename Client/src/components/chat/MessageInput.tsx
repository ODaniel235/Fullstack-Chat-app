import React, { useState } from "react";
import { Loader, Send } from "lucide-react";
import analyzeText from "@/utils/chatModeration";
import { useToast } from "@/hooks/use-toast";
import useChatStore from "@/store/useChatStore";
import { useLocation } from "react-router-dom";
import useGroupStore from "@/store/useGroupStore";
interface MessageInputProp {
  participantId: any;
  type?: string;
}
export const MessageInput: React.FC<MessageInputProp> = ({
  participantId,
  type,
}) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const { handleSendMessage } = useGroupStore();
  const { handleMessage } = useChatStore();
  const location = useLocation();
  // TODO: Implement message sending functionality
  const wipeMessage = () => {
    setMessage("");
    setIsSending(false);
  };
  const handleSend = async () => {
    setIsSending(true);
    console.log("Sending message:", message);
    const vulgarScore = await analyzeText(message);
    const roundedScore = Math.round(vulgarScore?.score);
    if (roundedScore == 1) {
      toast({
        variant: "destructive",
        title: "Warning",
        description:
          "Message contains explicit content, Please rephrase your message",
      });
      setIsSending(false);
      return;
    }
    if (type !== "group") {
      await handleMessage(
        "text",
        participantId,
        message,
        toast,
        wipeMessage,
        location.pathname
      );
    } else {
      console.log("Sending message to GC", participantId);
      await handleSendMessage(participantId, message, toast, wipeMessage);
    }
    setIsSending(false);
  };

  return (
    <div className="flex-1 flex items-center space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        placeholder="Type a message..."
      />
      <button
        onClick={handleSend}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {isSending ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
