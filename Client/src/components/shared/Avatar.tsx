import React from "react";

const generateColor = (name: string) => {
  const colors = [
    "#F87171", // Red
    "#FBBF24", // Yellow
    "#34D399", // Green
    "#60A5FA", // Blue
    "#A78BFA", // Purple
    "#F472B6", // Pink
    "#FB923C", // Orange
  ];
  const index =
    name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const Avatar = ({
  avatar,
  alt,
  name,
}: {
  avatar: string;
  alt: string;
  name: string;
}) => {
  const bgColor = generateColor(name);
  return avatar !== null ? (
    <img src={avatar} alt={alt} className="w-20 h-20 rounded-full" />
  ) : (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-medium"
      style={{ backgroundColor: bgColor }}
    >
      {name && name.substring(0, 1)?.toUpperCase()}
    </div>
  );
};

export default Avatar;
