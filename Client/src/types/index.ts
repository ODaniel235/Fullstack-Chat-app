export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
  theme?: "light" | "dark" | "system";
  email: string;
  phone?: string;
  location?: string;
  privacySettings?: {
    showOnlineStatus: boolean;
    readReceipts: boolean;
    profilePhotoVisibility: "everyone" | "nobody" | "custom";
    excludedUsers?: string[];
  };
  twoFactorEnabled?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "audio" | "video" | "image";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastActivity: Date;
  unreadCount: number;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  members: User[];
  messages: Message[];
  lastActivity: Date;
  unreadCount: number;
  admins: string[];
  lastMessage: {
    type: "audio" | "video" | "text";
  };
}

export interface AppState {
  currentUser: User | null;
  chats: Chat[];
  groups: Group[];
  activeChat: string | null;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  setActiveChat: (chatId: string | number) => void;
  joinGroup: (groupId: string) => Promise<void>;
}
export type CallType = "audio" | "video" | "none";
type CallStatus = "incoming" | "outgoing" | "active" | null;

export interface CallState {
  inCall: boolean;
  callType: CallType;
  participants: [caller: string, participant: string] | null; // List of participants (e.g., caller and callee IDs)
  status: CallStatus;
  callId: string | null; // Unique identifier for the call
  userData: User | null;
  setCall: (
    userData: User,
    type: CallType,
    caller: string,
    participant: string,
    callId: string,
    status: CallStatus
  ) => void;
  endCall: () => void; // Function to reset the call state when the call ends
}
export * from "./statusTypes";
