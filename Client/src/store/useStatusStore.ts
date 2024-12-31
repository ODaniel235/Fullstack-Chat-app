import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

const useStatusStore = create<any>((set, get) => ({
  myStatuses: null,
  otherStatuses: null,
  fetchStatus: async (toast: Function) => {
    try {
      const response = await axiosInstance.get("/status/");
      console.log("Statuses===>", response);
      set({ myStatuses: response.data.myStatus });
      set({ otherStatuses: response.data.allStatuses });
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
