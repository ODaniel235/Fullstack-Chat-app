import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sampleUsers } from '../../data/sampleData';

export const UserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredUsers = sampleUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessageUser = (userId: string) => {
    // TODO: Implement chat creation logic
    navigate(`/chat/${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              <div 
                className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 cursor-pointer"
                onClick={() => handleViewProfile(user.id)}
              />
              <div className="p-4">
                <div className="flex items-end -mt-12 mb-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 cursor-pointer"
                    onClick={() => handleViewProfile(user.id)}
                  />
                  <div className="ml-4 mb-2 flex-1">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.status === 'online' ? 'bg-green-100 text-green-800' :
                      user.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleMessageUser(user.id)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};