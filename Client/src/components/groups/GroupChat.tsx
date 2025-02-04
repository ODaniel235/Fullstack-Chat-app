import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageInput } from "../chat/MessageInput";
import { MessageList } from "../chat/MessageList";
import { GroupHeader } from "./GroupHeader";
import useGroupStore from "@/store/useGroupStore";
import GroupChatMessageList from "./GroupMessageList";
import useAuthStore from "@/store/useAuthStore";

export const GroupChat: React.FC = () => {
  const { groupId } = useParams();
  const { userData, socket } = useAuthStore();
  const { groups } = useGroupStore();
  if (!groups || !groupId) return;
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Group not found</p>
      </div>
    );
  }
  useEffect(() => {
    socket.emit("markGroupMessageAsSeen", {
      groupId: group.id,
      userId: userData.id,
    });
  }, []);
  return (
    <div className="h-full flex flex-col">
      <GroupHeader group={group} />
      <GroupChatMessageList
        messages={group.messages}
        currentUserId={userData.id}
      />
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <MessageInput type="group" participantId={groupId} />
      </div>
    </div>
  );
};
