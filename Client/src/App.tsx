import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MainLayout } from "./components/layout/MainLayout";
import { ChatWindow } from "./components/chat/ChatWindow";
import { Settings } from "./pages/Settings";
import { ChatList } from "./pages/ChatList";
import { Status } from "./pages/Status";
import { UserProfile } from "./pages/UserProfile";
import { GroupList } from "./components/groups/GroupList";
import { GroupChat } from "./components/groups/GroupChat";
import { GroupInfo } from "./components/groups/GroupInfo";
import { SignIn } from "./pages/auth/SignIn";
import { SignUp } from "./pages/auth/SignUp";
import { UserSearch } from "./components/user/UserSearch";
import AuthProvider from "./hooks/useAuthContext";
function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENTID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/chats" replace />} />
              <Route path="chats" element={<ChatList />} />
              <Route path="chat/:chatId" element={<ChatWindow />} />
              <Route path="status" element={<Status />} />
              <Route path="groups" element={<GroupList />} />
              <Route path="groups/:groupId" element={<GroupChat />} />
              <Route path="groups/:groupId/info" element={<GroupInfo />} />
              <Route path="settings" element={<Settings />} />
              <Route path="user/:userId" element={<UserProfile />} />
              <Route path="search" element={<UserSearch />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
