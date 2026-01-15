/**
 * Modal Component
 * Responsive modal dialog - full screen on mobile, centered on desktop
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Size classes for different screen sizes
  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl',
    full: 'sm:max-w-full sm:mx-4',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className={`relative bg-white w-full h-full sm:h-auto sm:rounded-xl shadow-xl ${sizeClasses[size]} sm:max-h-[90vh] overflow-hidden`}
              >
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-primary-200 sticky top-0 bg-white z-10">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary-900">{title}</h3>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <IoClose size={24} />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(100vh-4rem)] sm:max-h-[calc(90vh-4rem)]">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
