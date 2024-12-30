import { Chat } from "@/types";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";
interface useChatsStore {
  chats: Chat[];
}
const useChatStore = create<any>((set, get) => ({
  chats: [],
  setChats: (data) => {
    set({ chats: data });
  },
  fetchConversation: async (toast: Function) => {
    try {
      const response = await axiosInstance.get("/message", {
        withCredentials: true,
      });
      console.log(response.data.conversations);
      get().setChats(response.data.conversations);
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
