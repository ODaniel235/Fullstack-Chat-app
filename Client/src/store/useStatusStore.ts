import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

const useStatusStore = create<any>((set, get) => ({
  myStatuses: null,
  otherStatuses: [],
  setMyStatus: (data) => {
    set({ myStatuses: data });
  },
  setOtherStatuses: (data) => {
    set((state) => {
      console.log("New status=====>", data);
      const otherStatuses = state.otherStatuses.map((status) =>
        status.userId === data.userId
          ? { ...status, statuses: [...status.statuses, ...data.statuses] }
          : status
      );

      // If the userId does not exist, add it to the list
      const userExists = state.otherStatuses.some(
        (status) => status.userId === data.userId
      );
      if (!userExists) {
        otherStatuses.push({
          userId: data.userId,
          poster: data.poster || "Unknown", // Default to 'Unknown' if poster isn't provided
          profilePicture: data.profilePicture || "",
          statuses: data.statuses,
        });
      }

      return { otherStatuses };
    });
  },
  setLikeStatus: (data) => {
    set((state) => {
      console.log("New like status=====>", data);

      const otherStatuses = state.otherStatuses.map((status) => {
        if (status.userId === data.userId) {
          return {
            ...status,
            statuses: status.statuses.map((statusItem) =>
              statusItem.id === data.status.id
                ? {
                    ...statusItem,
                    likes: statusItem.likes.includes(data.userId)
                      ? statusItem.likes.filter((like) => like !== data.userId) // Unlike: remove the userId
                      : [...statusItem.likes, data.userId], // Like: add the userId
                  }
                : statusItem
            ),
          };
        }
        return status;
      });

      return { otherStatuses };
    });
  },

  editStatus: (data) => {
    set((state) => {
      const updatedStatuses = state.otherStatuses.map((status) => {
        if (status.userId === data.userId) {
          // Spread the existing status and override only the fields present in data
          return { ...status, ...data };
        }
        return status;
      });

      return { otherStatuses: updatedStatuses };
    });
  },

  fetchStatus: async (toast: Function) => {
    try {
      const response = await axiosInstance.get("/status/");
      set({ myStatuses: response.data.myStatus });
      set({ otherStatuses: response.data.allStatuses });
      console.log(response);
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
        console.log(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occoured",
        });
      }
    }
  },
  createStatus: async (
    type: string,
    content: string,
    toast: Function,
    backgroundColor?: string
  ) => {
    try {
      const response = await axiosInstance.post("/status/new", {
        type,
        content,
        backgroundColor: backgroundColor,
      });
      console.log(response);
      if (response.status == 201) {
        console.log(response);
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
        console.log(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occoured",
        });
      }
    }
  },
}));
export default useStatusStore;
