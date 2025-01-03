import { useState, useEffect } from "react";

export function formatDistanceToNow(timestamp: number): string {
  const date = new Date(timestamp); // Convert the timestamp to a Date object
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

export const TimeAgo = ({ timestamp }: { timestamp: number }) => {
  const [timeAgo, setTimeAgo] = useState(formatDistanceToNow(timestamp));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeAgo(formatDistanceToNow(timestamp));
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup the interval when the component unmounts
  }, [timestamp]);

  return timeAgo;
};
