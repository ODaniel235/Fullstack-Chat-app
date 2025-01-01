import { create } from "zustand";

const useThemeStore = create<any>((set, get) => ({
  theme: null,
  changeThemes: (value: string) => {
    switch (value) {
      case "dark":
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        set({ theme: "dark" });
        break;
      case "light":
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        set({ theme: "light" });
        break;
      default:
        document.documentElement.classList.remove("dark", "light");
        const isDarkMode = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.classList.toggle("dark", isDarkMode);
        console.log(isDarkMode);
        set({ theme: "system" });
        break;
    }
  },
}));
export default useThemeStore;
