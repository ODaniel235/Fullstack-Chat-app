import React from "react";
import { useNavigate } from "react-router-dom";
import { Users2 } from "lucide-react";
import { Group } from "../../types";
import Avatar from "../shared/Avatar";

interface GroupHeaderProps {
  group: Group;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ group }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-800">
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => navigate(`/groups/${group.id}/info`)}
      >
        <Avatar avatar={group.avatar} alt="group" name={group.name} />

        <div>
          <h2 className="font-semibold">{group.name}</h2>
          <p className="text-sm text-gray-500">
            {group.members.length} members
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate(`/groups/${group.id}/info`)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <Users2 className="w-5 h-5" />
      </button>
    </div>
  );
};
