import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useStore } from "../../store/useStore";
import { sampleGroups } from "../../data";

export const GroupInfo: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const groups = sampleGroups;
  const group = groups.find((g) => g.id === groupId);
  if (!group) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Group not found</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 flex items-center space-x-4">
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Group Info</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={group.avatar}
                alt={group.name}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold">{group.name}</h2>
                <p className="text-gray-500">{group.members.length} members</p>
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Members</h3>
              <div className="space-y-4">
                {group.members.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      onClick={() => navigate(`/user/${member.id}`)}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">
                        {group.admins.includes(member.id) ? "Admin" : "Member"}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        member.status === "online"
                          ? "bg-green-100 text-green-800"
                          : member.status === "away"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
