import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import useChatStore from "./useChatStore";
import useStatusStore from "./useStatusStore";

const useSocketStore = create<any>((set, get) => ({
  listenToSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("updatedProfile", (newProfile) => {
        // Handle the incoming data here
        useAuthStore.getState().setUser(newProfile);
      });
      socket.on("newMessage", (newMessage) => {
        const selectedChat = useChatStore.getState().selectedChat;
        console.log(newMessage);
        if (selectedChat.id == newMessage.conversation.id) {
          useChatStore.getState().setMessages(newMessage.conversation.messages);
        }
        useChatStore.getState().setChats(newMessage.allConvos);
      });
      socket.on("newStatus", (data) => {
        console.log(data);
        if (data.mine) {
          useStatusStore.getState().setMyStatus(data.status);
        }
      });
    }
  },
}));
export default useSocketStore;
