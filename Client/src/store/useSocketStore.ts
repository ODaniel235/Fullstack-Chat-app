import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import useChatStore from "./useChatStore";
import useStatusStore from "./useStatusStore";

const useSocketStore = create<any>((set, get) => ({
  listenToSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      /*       socket.on("updatedProfile", (newProfile: any) => {
        // Handle the incoming data here
        useAuthStore.getState().setUser(newProfile);
      }); */
      socket.on("newMessage", (newMessage: any) => {
        const selectedChat = useChatStore.getState().selectedChat;
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
          useStatusStore.getState().setOtherStatuses({
            userId: data.userId,
            poster: data.poster || "Unknown",
            profilePicture: data.profilePicture || "",
            statuses: [data.status], // Wrap the single status in an array
          });
        }
      });
      socket.on("userUpdated", (data: any) => {
        useStatusStore.getState().editStatus(data.newStatusData);
        console.log(data);
        useChatStore.getState().editUser(data.updatedData);
      });
    }
  },
}));
export default useSocketStore;
