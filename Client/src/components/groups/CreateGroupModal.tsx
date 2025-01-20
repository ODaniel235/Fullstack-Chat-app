import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader, Plus, X } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  handleSubmit: (e: React.FormEvent, id: string) => void;
  handleCreate: (
    e: React.FormEvent,
    groupName: string,
    groupId: string,
    avatar?: string
  ) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  handleSubmit,
  handleCreate,
  isLoading,
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [mode, setMode] = useState("join");
  const { handleFileUpload } = useAuthStore();
  const { toast } = useToast();
  const isCreateMode = mode === "create";
  const handleImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    const data = await handleFileUpload(file, toast);
    setAvatar(data);
  };
  const wipeFunc = () => {
    setGroupId("");
    setGroupName("");
    setAvatar(null);
  };
  useEffect(() => {
    wipeFunc();
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setMode("join")}
                  className={`flex-1 p-3 rounded-lg flex items-center justify-center space-x-2 ${
                    !isCreateMode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <span>Join Group</span>
                </button>

                <label
                  htmlFor="image"
                  onClick={() => {
                    setMode("create");
                  }}
                  className={`flex-1 p-3 rounded-lg flex items-center justify-center space-x-2 cursor-pointer ${
                    isCreateMode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <span>Create</span>
                </label>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                if (mode == "create") {
                  handleCreate(e, groupName, groupId, avatar);
                } else {
                  handleSubmit(e, groupId);
                }
              }}
              className="space-y-4"
            >
              {isCreateMode && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter Group Name..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  {isCreateMode ? "Group ID" : "Group ID or User Email"}
                </label>
                <input
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder={
                    isCreateMode
                      ? "Enter Group ID..."
                      : "Enter Group ID or User Email..."
                  }
                />
              </div>

              {isCreateMode && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Group Avatar (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpdate}
                    className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors ${
                  isLoading &&
                  "brightness-75 cursor-not-allowed flex justify-center items-center"
                }`}
              >
                {isLoading ? (
                  <Loader className="animate-spin" />
                ) : isCreateMode ? (
                  "Create Group"
                ) : (
                  "Join Group"
                )}{" "}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
