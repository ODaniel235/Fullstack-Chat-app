import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import useChatStore from "./useChatStore";
import useStatusStore from "./useStatusStore";
import useCallStore from "./useCallStore";
import useGroupStore from "./useGroupStore";

const useSocketStore = create<any>((set, get) => ({
  listenToSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("updatedProfile", (newProfile: any) => {
        // Handle the incoming data here
        useAuthStore.getState().setUser(newProfile.newProfile);
        useStatusStore.getState().setMyStatus(newProfile.statusData);
      });
      socket.on("newMessage", (newMessage: any) => {
        const selectedChat = useChatStore.getState().selectedChat;
        console.log({
          id: selectedChat.id,
          convo: newMessage.conversation.id,
        });
        console.log("New Message Socket ====>", newMessage);

        console.log(newMessage);
        console.log({ id: selectedChat.id, convo: newMessage.conversation.id });
        if (selectedChat?.id == newMessage.conversation.id) {
          useChatStore.getState().setMessages(newMessage.conversation.messages);
        }
        useChatStore.getState().setChats(newMessage.allConvos);
      });
      socket.on("newStatus", (data: any) => {
        console.log(data);
        if (data.mine) {
          useStatusStore.getState().setMyStatus(data.status);
        } else {
          console.log(data);
          useStatusStore.getState().setOtherStatuses({
            userId: data.userId,
            poster: data.poster || "Unknown",
            profilePicture: data.profilePicture || "",
            statuses: [data.status], // Wrap the single status in an array
          });
        }
      });
      socket.on("likedStatus", (data: any) => {
        console.log("Data===>", data);
        useStatusStore.getState().setLikeStatus({
          userId: data.userId,
          poster: data.poster || "Unknown",
          profilePicture: data.profilePicture || "",
          statuses: data.status,
        });
      });
      socket.on("userUpdated", (data: any) => {
        useStatusStore.getState().editStatus(data.newStatusData);
        console.log(data);
        useChatStore.getState().editUser(data.updatedData);
      });
      /*       socket.on("incomingSignal", (data: any) => {
        console.log("Incoming call===>", data);
        useCallStore.getState().setIncomingCall({
          callData: { ...data.callData, signal: data.signal },
          callerData: data.callerData,
          signal: data.signal,
        });
      }); */
      /*     socket.on("answerSignal", (data) => {
        console.log(data);
      }); */
      socket.on("groupCreated", (data) => {
        console.log("Group creation data receieved===>", data);
        useGroupStore.getState().handleAddGroup(data.groupData);
      });
      socket.on("joinedGroup", (data) => {
        console.log(data);
        useGroupStore.getState().handleAddGroup(data.group);
      });
      socket.on("leftGroup", (data) => {
        console.log(data);
        useGroupStore.getState().handleAddGroup(data.group);
      });
      socket.on("exitGroup", (data) => {
        console.log("Exit data====>", data.group);
        useGroupStore.getState().handleLeaveGroup(data.group.id);
      });
      socket.on("newGroupMessage", (data) => {
        console.log(data);
        useGroupStore.getState().handleNewGroupMessage(data.group);
      });
    }
  },
}));
export default useSocketStore;
