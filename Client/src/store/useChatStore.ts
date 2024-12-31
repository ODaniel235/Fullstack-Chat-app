import { Chat } from "@/types";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";
interface useChatsStore {
  chats: Chat[];
}
const useChatStore = create<any>((set, get) => ({
  chats: [],
  isFetchingConvo: true,
  selectedChat: [],
  isMessagesLoading: true,
  messages: [],
  fetchConversation: async (toast: Function) => {
    try {
      const response = await axiosInstance.get("/message", {
        withCredentials: true,
      });
      if (response.status == 200) {
        set({ chats: response.data.conversations });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        const err =
          error?.response?.data?.error || "An error occoured, please try again";
        toast({
          variant: "destructive",
          title: "Error",
          description: err,
        });
        return err;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occoured",
        });
      }
    }
  },
  fetchMessages: async (
    recipientId: string,
    toast: Function,
    navigate: Function
  ) => {
    try {
      set({ isMessagesLoading: true });
      if (!recipientId) navigate("/chats");
      const response = await axiosInstance.get(`/message/${recipientId}`);
      if (response.status == 200) {
        console.log("Messages====>", response);
        set({ messages: response.data });
      }
    } catch (error) {
      console.log("Error occoured===:>", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "An error occoured whilst fetching messages",
      });
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  handleChatClick: (id: string) => {
    const chat = get().chats;
    const filteredChat = chat.filter((p) => p.id == id)[0];
    set({ selectedChat: filteredChat });
  },
  handleMessage: async (
    type: string,
    participantId: string,
    content: string,
    toast: Function,
    wipeMessage: Function
  ) => {
    try {
      const response = await axiosInstance.post("/message/send", {
        receiverId: participantId,
        type: type,
        content: content,
      });

      if (response.status == 201) {
        console.log("Message sent:", response.data.data.newMessage);
        wipeMessage();
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        const err =
          error?.response?.data?.error || "An error occoured, please try again";
        toast({
          variant: "destructive",
          title: "Error",
          description: err,
        });
        return err;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occoured",
        });
      }
    }
  },
}));
export default useChatStore;
