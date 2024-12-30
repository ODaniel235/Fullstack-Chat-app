import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const Loading = ({ w, color }: { w: string; color: string }) => {
  return (
    <motion.div
      className={`flex justify-center items-center ${w} h-fit overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex justify-center items-center overflow-hidden"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <Star color={color} size={24} />
      </motion.div>
    </motion.div>
  );
};

export default Loading;
