import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TypingText: React.FC = () => {
  const [isNepali, setIsNepali] = useState(false);
  const text = isNepali ? "NepVoice. " : "NepVoice.";

  useEffect(() => {
    const interval = setInterval(() => {
      setIsNepali((prev) => !prev);
    }, 3000); // Switch every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-500 to-gray-700">
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}-${isNepali}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

export default TypingText; 