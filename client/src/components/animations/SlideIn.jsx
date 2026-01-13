import React from 'react';
import { motion } from 'framer-motion';

const SlideIn = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  direction = 'left',
  className = '' 
}) => {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: 100 },
    down: { y: -100 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration, 
        delay,
        type: 'spring',
        stiffness: 100 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
