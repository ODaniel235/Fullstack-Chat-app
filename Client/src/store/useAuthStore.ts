import { create } from "zustand";
import axiosInstance from "../utils/axios";
import { authSchema, loginAuthSchema } from "@/types/formType";
import { AxiosError } from "axios";
import { io } from "socket.io-client";
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8080" : "/";
const useAuthStore = create<any>((set, get) => ({
  isLoading: false,
  isCheckingAuth: true,
  socket: null,
  userData: null,

  signup: async (data: any, navigate: Function, toast: Function) => {
    try {
      set({ isCheckingAuth: true });
      set({ isLoading: true });
      const response = await axiosInstance.post("/auth/signup", data);
      console.log(response);

      if (response.status == 201) {
        set({ userData: response.data.data });
        get().connectSocket();
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
      set({ isCheckingAuth: false });
      set({ isLoading: false });
    }
  },
  login: async (data: any, navigate: Function, toast: Function) => {
    console.log(navigate, typeof navigate);
    try {
      set({ isCheckingAuth: true });
      set({ isLoading: true });
      const response = await axiosInstance.post("/auth/login", data);
      console.log(response);

      if (response.status == 200 || response.data == 201) {
        set({ userData: response.data.data });
        get().connectSocket();
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
      set({ isCheckingAuth: false });
      set({ isLoading: false });
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
