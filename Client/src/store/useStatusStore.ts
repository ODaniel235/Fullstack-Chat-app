import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

const useStatusStore = create<any>((set, get) => ({
  myStatuses: null,
  otherStatuses: null,
  setMyStatus: (data) => {
    set({ myStatuses: data });
  },
  setOther: (data) => {
    set((state) => {
      const updatedStatuses = state.otherStatuses.map((status) =>
        status.userId === data.userId ? { ...status, ...data } : status
      );
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
        backgroundColor,
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
