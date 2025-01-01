import { create } from "zustand";
import useAuthStore from "./useAuthStore";

const useSocketStore = create<any>((set, get) => ({
  fetchMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("updatedProfile", (newProfile) => {
        console.log("Socket data===>",newProfile);
      });
    }
  },
}));
export default useSocketStore;
