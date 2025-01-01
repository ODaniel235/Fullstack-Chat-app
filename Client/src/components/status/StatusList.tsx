import React from "react";
import { motion } from "framer-motion";
/* import { useStore } from "../../store/useStore"; */
import { formatDistanceToNow } from "../../utils/dateUtils";
import { statusView } from "../../types";
import useStatusStore from "@/store/useStatusStore";

interface StatusListProps {
  onStatusClick: (status: statusView) => void;
}

export const StatusList: React.FC<StatusListProps> = ({ onStatusClick }) => {
  const { myStatuses, otherStatuses } = useStatusStore();
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {myStatuses?.statuses.length > 0 && (
        <div className=" overflow-y-hidden">
          <h2 className="text-lg font-semibold mb-3">My Status</h2>
          <div className="space-y-3 overflow-y-hidden">
            {myStatuses?.statuses.map((status) => (
              <motion.div
                key={status.id}
                onClick={() => onStatusClick(status)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer overflow-y-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {status.type === "text" ? (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: status.backgroundColor }}
                      >
                        {status.content.substring(0, 4)}
                      </div>
                    ) : status.type == "image" ? (
                      <img
                        src={status.content}
                        alt="Status"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <video
                        src={status.content}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">My Status</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(status.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {status.views.length} views
                        </p>
                        <p className="text-sm text-gray-500">
                          {status.likes.length} likes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Updates</h2>
        <div className="space-y-3 overflow-y-hidden">
          {otherStatuses.length > 0 &&
            otherStatuses.map((status) => (
              <motion.div
                key={status.userId}
                onClick={() => {
                  console.log(status);
                  onStatusClick(status.data[0]);
                }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer overflow-y-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative overflow-y-hidden">
                    {status.statuses[status.data.length - 1].type === "text" ? (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl"
                        style={{
                          backgroundColor:
                            status.data[status.data.length - 1]
                              .backgroundColor || "yellow",
                        }}
                      >
                        {status.data[status.data.length - 1].content.substring(
                          0,
                          1
                        )}
                      </div>
                    ) : status.data[status.data.length - 1].type == "image" ? (
                      <img
                        src={status.data[status.data.length - 1].content}
                        alt="Status"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <video
                        src={status.data[status.data.length - 1].content}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800" />
                  </div>
                  <div>
                    <p className="font-semibold">{status.poster}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(
                        status.data[status.data.length - 1].timestamp
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};
