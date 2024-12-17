import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { MainLayout } from './components/layout/MainLayout';
import { ChatWindow } from './components/chat/ChatWindow';
import { Settings } from './pages/Settings';
import { ChatList } from './pages/ChatList';
import { Status } from './pages/Status';
import { UserProfile } from './pages/UserProfile';
import { GroupList } from './components/groups/GroupList';
import { GroupChat } from './components/groups/GroupChat';
import { GroupInfo } from './components/groups/GroupInfo';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { UserSearch } from './components/user/UserSearch';

function App() {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <BrowserRouter>
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
      </BrowserRouter>
    </Auth0Provider>
  );
}

export default App;