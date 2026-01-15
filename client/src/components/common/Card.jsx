/**
 * Card Component
 * Reusable card with responsive padding and optional hover effects
 */
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  hoverable = false,
  onClick,
  compact = false,
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, shadow: 'lg' } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-primary-200 shadow-sm
        ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-3 sm:mb-4">
          {title && (
            <h3 className="text-base sm:text-lg font-semibold text-primary-900">{title}</h3>
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
