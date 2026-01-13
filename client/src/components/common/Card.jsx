import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, shadow: 'lg' } : {}}
      onClick={onClick}
      className={`
        card
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-primary-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Card;
