import { Chat } from "@/types";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import React from "react";
import getBase64Size from "@/utils/sizeInBase";
interface useChatsStore {
  chats: Chat[];
}
const useChatStore = create<any>((set, get) => ({
  chats: [],
  isFetchingConvo: true,
  selectedChat: [],
  isMessagesLoading: true,
  messages: [],
  userSearch: null,
  setUserSearch: (data) => {
    set({ userSearc: data });
  },
  setMessages: (data) => {
    set({ messages: data });
  },

  setChats: (data) => {
    console.log(data);
    set({
      chats: data,
    });
  },

  fetchConversation: async (toast: Function) => {
    try {
      useAuthStore.getState().setIsCheckingAuth(true);

      const response = await axiosInstance.get("/message", {
        withCredentials: true,
      });
      console.log(response);
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
    } finally {
      useAuthStore.getState().setIsCheckingAuth(false);
    }
  },
  fetchMessages: async (
    recipientId: string,
    toast: Function,
    navigate: Function
  ) => {
    try {
      set({ isMessagesLoading: true });
      if (!recipientId) {
        navigate("/chats");
        return;
      }
      const response = await axiosInstance.get(`/message/${recipientId}`);
      if (response.status == 200) {
        set({ messages: response.data });
      }
    } catch (error) {
      console.log("Error occoured===:>", error);
      if (error instanceof AxiosError) {
        if (error.status == 404) return;
      }

      toast({
        title: "Error",
        variant: "destructive",
        description: "An error occoured whilst fetching messages",
      });
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  handleChatClick: (id: string, data?: any) => {
    const chat = get().chats;
    const filteredChat = chat.filter((p) => p.id == id)[0];
    if (id == "new") {
      set({ selectedChat: data });
      return;
    }
    set({ selectedChat: filteredChat });
    return;
  },
  handleMessage: async (
    type: string,
    participantId: string,
    content: string,
    toast: Function,
    wipeMessage: Function,
    location: string
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
        if (location === "/chat/new") {
          set({ selectedChat: response.data.data.conversation });
          set({ setActiveChat: response.data.data.conversation.id });
          get().handleChatClick(
            response.data.data.conversation.id,
            response.data.data.conversation
          );
        }
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
        console.log("Error here", error);
      }
    }
  },
  editUser: (data) => {
    console.log("User data====>", data);
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        const userExists = chat.participants.some(
          (participant) => participant.id === data.id
        );

        if (userExists) {
          // If the user exists, update their data (merge the user data with existing participants)
          return {
            ...chat,
            participants: chat.participants.map((participant) =>
              participant.id === data.id
                ? { ...participant, ...data } // Merge the new user data with the existing participant
                : participant
            ),
          };
        }
        console.log(chat);
        // If the user doesn't exist, return the chat unchanged
        return chat;
      });

      return {
        chats: updatedChats, // Update the state with the new chats array
      };
    });
  },

  fetchUser: async (
    onClose: Function,
    email: any,
    toast: Function,
    navigate: Function,
    e?: React.FormEvent
  ) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.get(`/auth/?email=${email}`);
      console.log(response);
      if (response.status == 200) {
        const blocked = response.data.user.blockedUsers.some(
          (id) => id == useAuthStore.getState().userData.id
        );
        console.log(blocked);
        if (blocked) {
          toast({
            variant: "destructive",
            title: "Oops",
            description: "You have been blocked by this user lol",
          });
          onClose();
          return;
        }
        set({ userSearch: response.data.user });
        console.log("Search ===>", response.data.user);
        navigate(`/user/${response.data.user.id}`);
      }
      // TODO: Implement group joining functionality
      onClose();
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
  blobToBase64: (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Read the Blob as Base64
    }),
  handleSpecialChatSend: async (
    audioBlob: Blob,
    wipeBlob: Function,
    toast: Function,
    participantId: string,
    folder: string
  ) => {
    const data = await get().blobToBase64(audioBlob);
    const size = await getBase64Size(data);
    if (parseFloat(size.sizeInMB) > 50) {
      toast({
        variant: "destructive",
        description: `File exceeds 50mb file limit as it is ${size}MB large`,
      });
      return;
    }
    await get().handleMessage(folder, participantId, data, toast, wipeBlob);
  },
}));
export default useChatStore;
