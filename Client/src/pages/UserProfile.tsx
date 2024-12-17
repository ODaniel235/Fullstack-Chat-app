import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sampleUsers } from '../data/sampleData';
import { UserProfileHeader } from '../components/user/UserProfileHeader';
import { UserProfileInfo } from '../components/user/UserProfileInfo';
import { CallModal } from '../components/chat/CallModal';
import { VideoCallModal } from '../components/chat/VideoCallModal';

export const UserProfile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [showCallModal, setShowCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);

  const user = sampleUsers.find(u => u.id === userId);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }

  const handleMessage = () => {
    navigate(`/chat/${userId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-auto bg-gray-50 dark:bg-gray-900"
    >
      <UserProfileHeader
        user={user}
        onMessage={handleMessage}
        onAudioCall={() => setShowCallModal(true)}
        onVideoCall={() => setShowVideoCallModal(true)}
      />

      <div className="max-w-3xl mx-auto -mt-8">
        <UserProfileInfo user={user} />
      </div>

      <CallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        user={user}
        type="audio"
      />

      <VideoCallModal
        isOpen={showVideoCallModal}
        onClose={() => setShowVideoCallModal(false)}
        user={user}
      />
    </motion.div>
  );
};