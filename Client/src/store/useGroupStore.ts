import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";
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
  handleCreateGroup: async (name, id, toast, avatar) => {
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
  handleFetchGroup: async () => {
    try {
      const res = await axiosInstance.get("/group");

      if (res.status == 200) {
        get().setGroup(res.data.groups);
      }
    } catch (error) {
      console.log(error);
    }
  },
  handleAddGroup: (data) => {
    set((state) => {
      // Check if the group already exists in the state
      const groupExists = state.groups.some((group) => group.id === data.id);

      if (groupExists) {
        // If group exists, update it
        return {
          groups: state.groups.map((group) =>
            group.id === data.id ? { ...group, ...data } : group
          ),
        };
      }

      // If the group doesn't exist, add it to the list
      return {
        groups: [...state.groups, data],
      };
    });
  },
  handleExitGroup: async (id, toast) => {
    try {
      const response = await axiosInstance.put(`/group/${id}/leave`);
      console.log(response);
      toast({ description: response.data.message });
    } catch (error) {
      console.log("Errorr===>>", error);
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
  handleLeaveGroup: (groupId: string) => {
    console.log(groupId);
    set((state) => {
      return {
        groups: state.groups.filter((group) => group.id !== groupId),
      };
    });
  },
  handleSendMessage: async (groupId, content, toast, wipeMessage) => {
    try {
      const response = await axiosInstance.post(`/group/new`, {
        groupId,
        content,
      });
      wipeMessage();
    } catch (error) {
      console.log("Errorr===>>", error);
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
  handleNewGroupMessage: (groupData) => {
    console.log(groupData);
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupData.id ? { ...group, ...groupData } : group
      ),
    }));
  },
}));
export default useGroupStore;
