import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');

  // TODO: Implement message sending functionality
  const handleSend = () => {
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="flex-1 flex items-center space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        placeholder="Type a message..."
      />
      <button
        onClick={handleSend}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};