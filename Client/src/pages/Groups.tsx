import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  avatar: string;
  lastMessage: {
    content: string;
    sender: string;
    timestamp: Date;
  };
  unreadCount: number;
}

const sampleGroups: Group[] = [
  {
    id: '1',
    name: 'Project Team',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
    lastMessage: {
      content: 'Meeting at 3 PM tomorrow',
      sender: 'John Doe',
      timestamp: new Date('2024-03-10T14:30:00')
    },
    unreadCount: 3
  },
  {
    id: '2',
    name: 'Family Group',
    avatar: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=100&h=100&fit=crop',
    lastMessage: {
      content: 'Don\'t forget mom\'s birthday!',
      sender: 'Jane Smith',
      timestamp: new Date('2024-03-10T12:00:00')
    },
    unreadCount: 5
  }
];

export const Groups: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="p-4 bg-white dark:bg-gray-800 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold">Groups</h1>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sampleGroups.map((group) => (
          <motion.div
            key={group.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={group.avatar}
                  alt={group.name}
                  className="w-12 h-12 rounded-full"
                />
                {group.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {group.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{group.name}</h3>
                  <span className="text-sm text-gray-500">
                    {group.lastMessage.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className={`text-sm ${
                  group.unreadCount > 0
                    ? 'font-semibold text-gray-900 dark:text-white'
                    : 'text-gray-500'
                }`}>
                  <span className="font-medium">{group.lastMessage.sender}:</span>{' '}
                  {group.lastMessage.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};