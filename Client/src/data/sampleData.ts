import { Chat, Message, User, Group } from "../types";

export const sampleUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    status: "online",
    theme: "system",
    email: "john@example.com",
    privacySettings: {
      showOnlineStatus: true,
      readReceipts: true,
      profilePhotoVisibility: "everyone",
    },
    twoFactorEnabled: false,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    status: "offline",
    theme: "light",
    email: "jane@example.com",
    privacySettings: {
      showOnlineStatus: true,
      readReceipts: true,
      profilePhotoVisibility: "everyone",
    },
    twoFactorEnabled: true,
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    status: "away",
    theme: "dark",
    email: "mike@example.com",
    privacySettings: {
      showOnlineStatus: false,
      readReceipts: false,
      profilePhotoVisibility: "nobody",
    },
    twoFactorEnabled: false,
  },
];

export const sampleMessages: Message[] = [
  {
    id: "1",
    senderId: "2",
    content: "Hey, how are you?",
    type: "text",
    timestamp: new Date("2024-03-10T10:00:00"),
    status: "read",
    isRead: true,
  },
  {
    id: "2",
    senderId: "1",
    content: "I'm good! How about you?",
    type: "text",
    timestamp: new Date("2024-03-10T10:01:00"),
    status: "read",
    isRead: true,
  },
  {
    id: "3",
    senderId: "2",
    content: "https://example.com/sample-audio.mp3",
    type: "audio",
    timestamp: new Date("2024-03-10T10:02:00"),
    status: "delivered",
    isRead: false,
  },
  {
    id: "4",
    senderId: "1",
    content: "/test.mp4",
    type: "video",
    timestamp: new Date("2024-03-10T10:03:00"),
    status: "sent",
    isRead: false,
  },
];

export const sampleGroups: Group[] = [
  {
    id: "1",
    name: "Project Team",
    avatar:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
    members: [sampleUsers[0], sampleUsers[1], sampleUsers[2]],
    lastMessage: { type: "audio" },
    messages: [
      {
        id: "1",
        senderId: "2",
        content: "Team meeting at 3 PM tomorrow",
        type: "text",
        timestamp: new Date("2024-03-10T14:30:00"),
        status: "delivered",
        isRead: false,
      },
      {
        id: "2",
        senderId: "3",
        content: "https://example.com/meeting-audio.mp3",
        type: "audio",
        timestamp: new Date("2024-03-10T14:35:00"),
        status: "delivered",
        isRead: false,
      },
    ],
    lastActivity: new Date("2024-03-10T14:35:00"),
    unreadCount: 3,
    admins: ["1", "2"],
  },
  {
    id: "2",
    name: "Design Team",
    avatar:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=100&h=100&fit=crop",
    members: [sampleUsers[0], sampleUsers[2]],
    lastMessage: {
      type: "video",
    },
    messages: [
      {
        id: "1",
        senderId: "3",
        content: "New design mockups ready for review",
        type: "text",
        timestamp: new Date("2024-03-10T09:00:00"),
        status: "delivered",
        isRead: false,
      },
    ],
    lastActivity: new Date("2024-03-10T09:00:00"),
    unreadCount: 1,
    admins: ["3"],
  },
  {
    id: "3",
    name: "Coffee Chat",
    avatar:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop",
    members: [sampleUsers[0], sampleUsers[1], sampleUsers[2]],
    lastMessage: {
      type: "text",
    },
    messages: [
      {
        id: "1",
        senderId: "2",
        content: "Anyone up for coffee tomorrow?",
        type: "text",
        timestamp: new Date("2024-03-09T16:00:00"),
        status: "read",
        isRead: true,
      },
    ],
    lastActivity: new Date("2024-03-09T16:00:00"),
    unreadCount: 0,
    admins: ["1"],
  },
];

export const sampleChats: Chat[] = [
  {
    id: "1",
    participants: [sampleUsers[0], sampleUsers[1]],
    messages: sampleMessages,
    lastActivity: new Date("2024-03-10T10:03:00"),
    unreadCount: 2,
  },
  {
    id: "2",
    participants: [sampleUsers[0], sampleUsers[2]],
    messages: [],
    lastActivity: new Date("2024-03-09T15:30:00"),
    unreadCount: 0,
  },
];
export const myStatuses = {
  userId: "1",
  poster: "me",
  profilePicture: "./dummyImg.jpg",
  data: [
    {
      id: "status1",
      type: "text",
      content: "Exploring the mountains today!",
      timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      backgroundColor: "#FFA726", // Orange background for text
      views: ["23456", "34567", "45678"], // IDs of viewers
      likes: ["23456", "45678"], // IDs of users who liked
      poster: "John Doe",
    },
  ],
};
export const sampleStatuses = [
  {
    userId: "12345",
    poster: "John Doe",
    profilePicture: "john-doe.jpg",
    data: [
      {
        id: "status2",
        userId: "12345", // Your user ID
        type: "image",
        /*  content: "https://via.placeholder.com/150", // Image URL */
        content: "./john-doe.jpg",
        timestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
        views: ["23456", "34567"],
        likes: ["2342"],
        liked: true,
      },
    ],
  },

  {
    userId: "23456",
    poster: "Jane Smith",
    profilePicture: "jane-smith.jpg",
    data: [
      {
        id: "222", // Another user ID
        type: "video",
        content: "https://www.w3schools.com/html/mov_bbb.mp4", // Video URL
        timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        views: ["12345"], // Viewed by you
        likes: ["2342"],
        liked: false,
      },
    ],
  },
  {
    id: "222",
    poster: "Alice Johnson",
    profilePicture: "johnson.jpg",
    data: [
      {
        id: "34567", // Another user ID
        type: "text",
        content: "Ashley, look at me!",
        timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        backgroundColor: "#C51D34", // Green background for text
        views: ["12345", "23456"],
        likes: ["2342"],
        liked: true,
      },
    ],
  },
];
