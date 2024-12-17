export interface statusView {
  id?: string;
  userId?: string; // Your user ID
  type?: string;
  content?: string;
  timestamp?: number; // 2 hours ago
  backgroundColor?: string; // Orange background for text
  views?: string[]; // IDs of viewers
  likes?: string[]; // IDs of users who liked
  poster?: string;
  liked?: boolean;
}
