import { create } from "zustand";
import { AppState } from "@auth0/auth0-react";
import { CallState, User } from "../types";

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  chats: [],
  groups: [],
  activeChat: null,
  theme: "system",
  setTheme: (theme) => set({ theme }),
  setActiveChat: (chatId) => set({ activeChat: chatId }),
  joinGroup: async (groupId) => {
    // TODO: Implement group joining logic
    console.log("Joining group:", groupId);
  },
}));
export const useCallStore = create<CallState>((set) => ({
  inCall: false,
  callType: "none",
  participants: null,
  status: null,
  callId: null,
  setCall: (user, type, caller, participant, callId, status) => {
    set({
      userData: user,
      inCall: true,
      callType: type,
      participants: [caller, participant],
      callId,
      status,
    });
  },
  userData: null,
  endCall: () => {
    set({
      userData: null,
      inCall: false,
      callType: "none",
      participants: null,
      status: null,
      callId: null,
    });
  },
}));
