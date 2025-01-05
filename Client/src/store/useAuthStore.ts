import { create } from "zustand";
import axiosInstance from "../utils/axios";
import { authSchema, loginAuthSchema } from "@/types/formType";
import { AxiosError } from "axios";
import { io } from "socket.io-client";
import getBase64Size from "@/utils/sizeInBase";
import React from "react";
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8080" : "/";
const useAuthStore = create<any>((set, get) => ({
  isLoading: false,
  isCheckingAuth: true,

  setIsCheckingAuth: (value: boolean) => set({ isCheckingAuth: value }),
  socket: null,
  userData: null,
  setUser: (data) => {
    set({ userData: data });
  },

  signup: async (data: any, navigate: Function, toast: Function) => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.post("/auth/signup", data);
      console.log(response);

      if (response.status == 201) {
        set({ userData: response.data.data });
        get().connectSocket();
        set({ isCheckingAuth: true });
        navigate("/chats");
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
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (data: any, navigate: Function, toast: Function) => {
    console.log(navigate, typeof navigate);
    try {
      set({ isLoading: true });
      const response = await axiosInstance.post("/auth/login", data);
      console.log(response);

      if (response.status == 200 || response.status == 201) {
        set({ userData: response.data.data });
        get().connectSocket();
        set({ isCheckingAuth: true });

        navigate("/chats");
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
    } finally {
      set({ isLoading: false });
    }
  },
  updateData: async (data: any, toast: Function) => {
    try {
      const {
        firstName,
        lastName,
        bio,
        theme,
        status,
        receipts,
        visibility,
        password,
        twostep,
        avatar,
      } = data;

      const userData = get().userData;

      // Check if no changes were made
      if (
        !firstName &&
        !lastName &&
        bio === userData.bio &&
        theme === userData.theme &&
        status === userData.privacySettings.showOnlineStatus &&
        receipts === userData.privacySettings.readReceipts &&
        visibility === userData.privacySettings.profileVisibility &&
        !password &&
        twostep === userData.twoFactorEnabled &&
        !avatar
      ) {
        return toast({
          variant: "destructive",
          title: "Error",
          description: "No changes made",
        });
      }
      const dataToUpdate = {
        firstName,
        lastName,
        bio,
        theme,
        status,
        receipts,
        visibility,
        password,
        twostep,
        avatar,
      };
      //simulate post request
      const response = await axiosInstance.put("/auth", dataToUpdate);
      if (response.status == 200) {
        console.log("Response===>", response.data);
        toast({
          title: "Success",
          description:
            response.data.message || "User account updated successfully",
        });
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
  handleFileUpload: async (value: any, toast: Function) => {
    const file = value; // Get the first selected file
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    try {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64String = reader.result as string;

          // Calculate Base64 size
          const baseSize = getBase64Size(base64String);

          // Check if the file exceeds the size limit
          if (parseFloat(baseSize.sizeInMB) > 50) {
            toast({
              variant: "destructive",
              title: "File too big",
              description: `Selected file is ${baseSize.sizeInMB}MB and exceeds the 50MB limit.`,
            });
            reject("File too large");
            return;
          }

          resolve(base64String); // Successfully resolve the Base64 string
        };

        // Error handling for the reader
        reader.onerror = (error) => {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
          });
          reject("File read error");
        };

        // Read the file as a data URL (Base64)
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  },

  handleUpdateData: async (
    e: React.ChangeEvent<HTMLInputElement>,
    toast: Function
  ) => {
    try {
      const base64string = await get().handleFileUpload(
        e.target.files?.[0],
        toast
      );
      console.log(base64string);
      await get().updateData({ avatar: base64string }, toast);
    } catch (error) {
      if (error instanceof AxiosError) {
        const err =
          error?.response?.data?.error ||
          "An error occurred, please try again.";
        toast({
          variant: "destructive",
          title: "Error",
          description: err,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while uploading the file.",
        });
      }
    }
  },
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ userData: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error getting auth", error);
      set({ userData: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  checkAuthInputs: async (data: any, type: string) => {
    let result;
    if (type == "signin") {
      result = loginAuthSchema.safeParse(data);
    } else {
      result = authSchema.safeParse(data);
    }
    if (!result.success) {
      const allErrors = result.error.errors.map((err) => err.message);
      console.log(allErrors);
      return allErrors;
    }
  },

  connectSocket: () => {
    const { userData } = get();
    if (!userData || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: userData.id,
      },
      withCredentials: true,
    });
    socket.connect();
    set({ socket: socket });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
export default useAuthStore;
