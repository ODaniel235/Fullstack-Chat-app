import React, { useEffect } from "react";
import { motion } from "framer-motion";
/* import { useStore } from "../../store/useStore"; */
import { TimeAgo } from "../../utils/dateUtils";
import { statusView } from "../../types";
import useStatusStore from "@/store/useStatusStore";

interface StatusListProps {
  onStatusClick: (status: statusView) => void;
  openCreateModal: (value: boolean) => void;
}

export const StatusList: React.FC<StatusListProps> = ({
  onStatusClick,
  openCreateModal,
}) => {
  const { myStatuses, otherStatuses } = useStatusStore();
  useEffect(() => {
    console.log("Status changed ===>", otherStatuses);
  }, [otherStatuses]);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className=" overflow-y-hidden">
        <h2 className="text-lg font-semibold mb-3">My Status</h2>
        <div className="space-y-3 overflow-y-hidden">
          <motion.div
            onClick={() => {
              if (myStatuses.statuses.length > 0) {
                onStatusClick(myStatuses.statuses[0]);
              } else {
                openCreateModal(true);
              }
            }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer overflow-y-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              {" "}
              {myStatuses?.statuses.length > 0 ? (
                <div className="relative">
                  {myStatuses.statuses[myStatuses.statuses.length - 1].type ===
                  "text" ? (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl"
                      style={{
                        backgroundColor:
                          myStatuses.statuses[myStatuses.statuses.length - 1]
                            .backgroundColor,
                      }}
                    >
                      {myStatuses.statuses[
                        myStatuses.statuses.length - 1
                      ].content.substring(0, 4)}
                    </div>
                  ) : myStatuses.statuses[myStatuses.statuses.length - 1]
                      .type == "image" ? (
                    <img
                      src={
                        myStatuses.statuses[myStatuses.statuses.length - 1]
                          .content
                      }
                      alt="Status"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <video
                      src={
                        myStatuses.statuses[myStatuses.statuses.length - 1]
                          .content
                      }
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={myStatuses?.profilePicture}
                    alt="Status"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">My Status</p>
                    <p className="text-sm text-gray-500">
                      {myStatuses?.statuses.length > 0 ? (
                        <TimeAgo
                          timestamp={
                            myStatuses.statuses[myStatuses.statuses.length - 1]
                              .timestamp
                          }
                        />
                      ) : (
                        "Update Status"
                      )}
                    </p>
                  </div>
                  {myStatuses?.statuses.length > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {
                          myStatuses.statuses[myStatuses.statuses.length - 1]
                            .views.length
                        }{" "}
                        view
                        {myStatuses.statuses[myStatuses.statuses.length - 1]
                          .views.length > 1 && "s"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {
                          myStatuses.statuses[myStatuses.statuses.length - 1]
                            .likes.length
                        }{" "}
                        like
                        {myStatuses.statuses[myStatuses.statuses.length - 1]
                          .likes.length > 0 && "s"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Updates</h2>
        <div className="space-y-3 overflow-y-hidden">
          {otherStatuses?.length > 0 &&
            otherStatuses.map((status) => {
              if (status.statuses.length > 0) {
                return (
                  <motion.div
                    key={status.userId}
                    onClick={() => {
                      console.log(status);
                      onStatusClick(status.statuses[0]);
                    }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer overflow-y-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative overflow-y-hidden">
                        {status.statuses &&
                        status.statuses.length > 0 &&
                        status?.statuses[status?.statuses.length - 1].type ===
                          "text" ? (
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl"
                            style={{
                              backgroundColor:
                                status.statuses[status.statuses.length - 1]
                                  .backgroundColor || "yellow",
                            }}
                          >
                            {status.statuses[
                              status.statuses.length - 1
                            ].content.substring(0, 1)}
                          </div>
                        ) : status.statuses &&
                          status.statuses.length > 0 &&
                          status.statuses[status.statuses.length - 1].type ==
                            "image" ? (
                          <img
                            src={
                              status.statuses[status.statuses.length - 1]
                                .content
                            }
                            alt="Status"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <video
                            src={
                              status.statuses.length > 0 &&
                              status.statuses &&
                              status.statuses[status.statuses.length - 1]
                                .content
                            }
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800" />
                      </div>
                      <div>
                        <p className="font-semibold">{status.poster}</p>
                        <p className="text-sm text-gray-500">
                          <TimeAgo
                            timestamp={
                              status.statuses[status.statuses.length - 1]
                                .timestamp
                            }
                          />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            })}
        </div>
      </div>
    </div>
  );
};
