import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageInput } from "../chat/MessageInput";
import { MessageList } from "../chat/MessageList";
import { GroupHeader } from "./GroupHeader";
import { useStore } from "../../store/useStore";
import { sampleGroups } from "../../data";

export const GroupChat: React.FC = () => {
  const { groupId } = useParams();
  const groups = sampleGroups;
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Group not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <GroupHeader group={group} />
      <MessageList messages={group.messages} />
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <MessageInput
          onSend={(message) => {
            // TODO: Implement group message sending
            console.log("Sending group message:", message);
          }}
          disableMediaMessages
        />
      </div>
    </div>
  );
};
