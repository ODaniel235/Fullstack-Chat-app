import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ErrorPage: React.FC = () => {
  const handleRetry = () => {
    window.location.href = "/";
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse overflow-y-hidden" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 px-2">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium mx-auto"
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          Retry
        </button>
      </motion.div>
    </div>
  );
};
export default ErrorPage;
