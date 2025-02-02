import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import useAuthStore from "./store/useAuthStore";
import { Loader } from "lucide-react";
import useStatusStore from "./store/useStatusStore";
import { useToast } from "./hooks/use-toast";
import useThemeStore from "./store/useThemeStore";
import useSocketStore from "./store/useSocketStore";
import ErrorBoundary from "./components/shared/ErrorBoundary";

function App() {
  const { toast } = useToast();
  const { userData, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { myStatuses, fetchStatus } = useStatusStore();
  const { listenToSocket } = useSocketStore();
  const { changeThemes } = useThemeStore();

  useEffect(() => {
    checkAuth();
    if (!myStatuses) {
      if (location.pathname !== "/signin" && location.pathname !== "/signup") {
        fetchStatus(toast);
      }
    }
  }, [checkAuth, location.pathname]);

  useEffect(() => {
    if (!userData) return;
    changeThemes(userData.theme, toast);
  }, [userData]);
  useEffect(() => {
    listenToSocket();
  }, [socket]);

  if (isCheckingAuth && !userData)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENTID}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Navigate to={"/chats"} />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<MainLayout />}>
              <Route
                index
                element={
                  userData ? (
                    <Navigate to="/chats" replace />
                  ) : (
                    <Navigate to="/signin" />
                  )
                }
              />
              <Route
                path="chats"
                element={userData ? <ChatList /> : <Navigate to="/signin" />}
              />
              <Route
                path="chat/:chatId"
                element={userData ? <ChatWindow /> : <Navigate to="/signin" />}
              />
              <Route
                path="status"
                element={userData ? <Status /> : <Navigate to="/signin" />}
              />
              <Route
                path="groups"
                element={userData ? <GroupList /> : <Navigate to="/signin" />}
              />
              <Route
                path="groups/:groupId"
                element={userData ? <GroupChat /> : <Navigate to="/signin" />}
              />
              <Route
                path="groups/:groupId/info"
                element={userData ? <GroupInfo /> : <Navigate to="/signin" />}
              />
              <Route
                path="settings"
                element={userData ? <Settings /> : <Navigate to="/signin" />}
              />
              <Route
                path="user/:userId"
                element={userData ? <UserProfile /> : <Navigate to="/signin" />}
              />
              <Route
                path="search"
                element={userData ? <UserSearch /> : <Navigate to="/signin" />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
