import { create } from "zustand";
import axiosInstance from "../utils/axios";
import Cookies from "js-cookie";
import { authSchema, loginAuthSchema } from "@/types/formType";
import { AxiosError } from "axios";
const useAuthStore = create<any>((set, get) => ({
  isLoading: false,
  setLoading: (bool: boolean) => set({ isLoading: bool }),
  userData: {
    id: "",
    name: "",
    avatar: "",
    status: "",
    theme: "",
    email: "",
    privacySettings: {
      showOnlineStatus: true,
      readReceipts: true,
      profilePhotoVisibility: "",
    },
    twoFactorEnabled: false,
  },
  setUserData: (data) => {
    set({ userData: data });
  },
  signup: async (data: any, navigate: Function, toast: Function) => {
    try {
      get().setLoading(true);
      const response = await axiosInstance.post("/auth/signup", data);
      console.log(response);
      get().setUserData(response.data.data);
      Cookies.set(
        "Credentials",
        JSON.stringify({
          name: response.data.data.name,
          avatar: response.data.data.avatar,
          email: response.data.data.email,
          theme: response.data.data.theme,
          status: "online",
          privacySettings: {
            showOnlineStatus:
              response.data.data.privacySettings.showOnlineStatus,
            readReceipts: response.data.data.privacySettings.readReceipts,
            profileVisibility:
              response.data.data.privacySettings.profileVisibility,
          },
        }),
        {
          expires: 7,
        }
      );
      if (response.status == 201) {
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
        return err;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occoured",
        });
      }
    } finally {
      get().setLoading(false);
    }
  },
  login: async (data: any, navigate: Function, toast: Function) => {
    console.log(navigate, typeof navigate);
    try {
      get().setLoading(true);
      const response = await axiosInstance.post("/auth/login", data);
      console.log(response);
      get().setUserData(response.data.data);
      Cookies.set(
        "Credentials",
        JSON.stringify({
          name: response.data.data.name,
          avatar: response.data.data.avatar,
          email: response.data.data.email,
          theme: response.data.data.theme,
          status: "online",
          privacySettings: {
            showOnlineStatus:
              response.data.data.privacySettings.showOnlineStatus,
            readReceipts: response.data.data.privacySettings.readReceipts,
            profileVisibility:
              response.data.data.privacySettings.profileVisibility,
          },
        }),
        {
          expires: 7,
        }
      );
      if (response.status == 200 || response.data == 201) {
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
        return err;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occoured",
        });
      }
    } finally {
      get().setLoading(false);
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
}));
export default useAuthStore;
