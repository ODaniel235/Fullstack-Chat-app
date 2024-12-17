import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { StatusList } from "../components/status/StatusList";
import { StatusViewer } from "../components/status/StatusViewer";
import { CreateStatusModal } from "../components/status/CreateStatusModal";

import { myStatuses, sampleStatuses } from "../data";
import { statusView } from "../types";

export const Status: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<statusView | null>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const onClose = () => {
    setSelectedStatus(null);
  };const handlePrevious = (isMine?: boolean) => {
    if (isMine) {
      // Handle "myStatuses"
      const currentIndex = myStatuses.data.findIndex(
        (s) => s.id === selectedStatus?.id
      );
      if (currentIndex > 0) {
        setSelectedStatus(myStatuses.data[currentIndex - 1]); // Set previous status
      } else {
        console.log("No previous status available in myStatuses.");
        onClose();
      }
    } else {
      // Handle "sampleStatuses"
      const groupIndex = sampleStatuses.findIndex((group) =>
        group.data.some((status) => status.id === selectedStatus?.id)
      );

      if (groupIndex !== -1) {
        const currentGroup = sampleStatuses[groupIndex];
        const currentStatusIndex = currentGroup.data.findIndex(
          (status) => status.id === selectedStatus?.id
        );

        if (currentStatusIndex > 0) {
          // Previous status in the same group
          setSelectedStatus(currentGroup.data[currentStatusIndex - 1]);
          console.log(
            "Previous status in current group:",
            currentGroup.data[currentStatusIndex - 1]
          );
        } else if (groupIndex > 0) {
          // Move to the last status of the previous group
          const previousGroup = sampleStatuses[groupIndex - 1];
          const lastStatusInPreviousGroup =
            previousGroup.data[previousGroup.data.length - 1];
          setSelectedStatus(lastStatusInPreviousGroup);
          console.log(
            "Last status in previous group:",
            lastStatusInPreviousGroup
          );
        } else {
          // No previous groups or statuses
          console.log("No previous status available. Closing modal.");
          onClose();
        }
      } else {
        console.log("Status not found in sampleStatuses. Closing modal.");
        onClose();
      }
    }
  };

  const handleNext = (isMine?: boolean) => {
    if (isMine) {
      const nextStatus =
        myStatuses.data.findIndex((s) => s.id == selectedStatus?.id) + 1;
      setSelectedStatus(myStatuses.data[nextStatus]);
    } else {
      // Handling "sampleStatuses"
      const statusIndex = sampleStatuses.findIndex((s) =>
        s.data.some((d) => d.id === selectedStatus?.id)
      );

      if (statusIndex !== -1) {
        const currentGroup = sampleStatuses[statusIndex];
        const currentStatusIndex = currentGroup.data.findIndex(
          (s) => s.id === selectedStatus?.id
        );

        // Check if there's a next status in the current group
        const nextStatus = currentGroup.data[currentStatusIndex + 1];

        if (nextStatus) {
          setSelectedStatus(nextStatus); // Set the next status in the current group
          console.log("Current group");
        } else {
          // Check if there's a next group
          const nextGroupIndex = statusIndex + 1;

          if (currentStatusIndex + 1 < currentGroup.data.length) {
            // There is a next status in the current group
            const nextStatus = currentGroup.data[currentStatusIndex + 1];
            setSelectedStatus(nextStatus);
            console.log("Next status in current group:", nextStatus);
          } else if (nextGroupIndex < sampleStatuses.length) {
            // No next status in the current group, check the next group
            const nextGroup = sampleStatuses[nextGroupIndex];
            if (nextGroup.data.length > 0) {
              const firstStatusInNextGroup = nextGroup.data[0];
              setSelectedStatus(firstStatusInNextGroup);
              console.log(
                "First status in next group:",
                firstStatusInNextGroup
              );
            } else {
              // Next group is empty (unlikely but handled)
              console.log("Next group is empty.");
              onClose();
            }
          } else {
            // No next group exists, close the modal
            console.log("No next group available. Closing modal.");
            onClose();
          }
        }
      } else {
        onClose(); // Status not found in sampleStatuses
      }
    }
  };
  const onStatusClick = (status: statusView) => {
    setSelectedStatus(status);
    console.log(status);
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <h1 className="text-xl font-semibold">Status Updates</h1>
      </div>

      <StatusList onStatusClick={onStatusClick} />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreateModal(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {selectedStatus && (
          <StatusViewer
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            statusData={selectedStatus}
            onClose={onClose}
          />
        )}
      </AnimatePresence>

      <CreateStatusModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
