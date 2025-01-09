import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import useChatStore from "./useChatStore";
import useStatusStore from "./useStatusStore";
import useCallStore from "./useCallStore";

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
        console.log("New Message Socket ====>", newMessage);
        const selectedChat = useChatStore.getState().selectedChat;
        console.log(newMessage);
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
      socket.on("incomingSignal", (data: any) => {
        console.log("Incoming call===>", data);
        useCallStore.getState().setIncomingCallData({
          callData: data.callData,
          callerData: data.callerData,
          signal: data.signal,
        });
      });
      socket.on("answerSignal");
    }
  },
}));
export default useSocketStore;
