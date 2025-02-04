import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const shortenText = (text: string, maxLength: number = 20): string => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
