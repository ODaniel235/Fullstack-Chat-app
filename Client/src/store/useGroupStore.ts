import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";
import useAuthStore from "./useAuthStore";
interface handleCreateGroup {
  id: string;
  name: string;
  toast: Function;
  avatar?: string;
}
const useGroupStore = create<any>((set, get) => ({
  groups: null,
  setGroup: (data) => {
    set({ groups: data });
  },
  handleCreateGroup: async (id, name, toast, avatar) => {
    try {
      const response = await axiosInstance.post("/group/create", {
        id,
        name,
        avatar,
      });
      console.log(response);
      if (response.status == 201) {
        toast({ description: "Joined group successfully" });
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
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occoured",
        });
      }
    }
  },
  handleJoinGroup: async (groupId, toast) => {
    try {
      const response = await axiosInstance.post("/group/join", { groupId });
      console.log(response);
      if (response.status == 200) {
        toast({ description: "Joined group successfully" });
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
export default useGroupStore;
