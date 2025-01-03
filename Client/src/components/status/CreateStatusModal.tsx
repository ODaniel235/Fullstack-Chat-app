import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, Type, X, Loader } from "lucide-react";
import { useStore } from "../../store/useStore";
import useStatusStore from "@/store/useStatusStore";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [statusType, setStatusType] = useState<"text" | "image" | "video">(
    "text"
  );
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#6B7280");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleFileUpload } = useAuthStore();
  const [inputData, setInputData] = useState<string>("");
  const { createStatus } = useStatusStore();
  const { toast } = useToast();
  const handleSubmit = async () => {
    const shouldReturn = statusType == "text" ? !content : !inputData;
    if (shouldReturn) return;
    setIsLoading(true);
    const data = statusType == "text" ? content : inputData;
    const bgColor = statusType == "text" ? backgroundColor : null;
    console.log(data);
    await createStatus(statusType, data, toast, null);

    onClose();
    setContent("");
    setIsLoading(false);
    setStatusType("text");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const toBase = await handleFileUpload(e.target?.files?.[0]);
    setInputData(toBase);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg"
          >
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Create Status</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setStatusType("text")}
                  className={`flex-1 p-3 rounded-lg flex items-center justify-center space-x-2 ${
                    statusType === "text"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Type className="w-5 h-5" />
                  <span>Text</span>
                </button>
                <label
                  htmlFor="image"
                  onClick={() => {
                    setStatusType("image");
                    fileInputRef.current?.click();
                  }}
                  className={`flex-1 p-3 rounded-lg flex items-center justify-center space-x-2 ${
                    statusType === "image"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Image className="w-5 h-5" />
                  <span>Image</span>
                </label>
                <label
                  htmlFor="video"
                  onClick={() => {
                    setStatusType("video");
                    fileInputRef.current?.click();
                  }}
                  className={`flex-1 p-3 rounded-lg flex items-center justify-center space-x-2 ${
                    statusType === "video"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span>Video</span>
                </label>
              </div>

              <input
                type="file"
                id="image"
                className="hidden"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
              />
              <input
                type="file"
                id="video"
                className="hidden"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
              />

              {statusType === "text" ? (
                <>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-32 p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 mb-4 resize-none"
                  />
                  <div className="flex space-x-2 mb-4">
                    {[
                      "#6B7280",
                      "#EF4444",
                      "#3B82F6",
                      "#10B981",
                      "#8B5CF6",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        className={`w-8 h-8 rounded-full ${
                          backgroundColor === color
                            ? "ring-2 ring-offset-2 ring-blue-500"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="aspect-square mb-4 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {inputData ? (
                    statusType === "image" ? (
                      <img
                        src={inputData}
                        alt="Status preview"
                        className="max-h-full rounded-lg"
                      />
                    ) : (
                      <video
                        src={inputData}
                        className="max-h-full rounded-lg"
                        controls
                      />
                    )
                  ) : (
                    <label htmlFor={statusType} className="text-center">
                      <p className="text-gray-500 mb-2">
                        No {statusType} selected
                      </p>
                      <label
                        htmlFor={statusType}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Click to upload
                      </label>
                    </label>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={statusType == "text" ? !content : !inputData}
                className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Share Status"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
