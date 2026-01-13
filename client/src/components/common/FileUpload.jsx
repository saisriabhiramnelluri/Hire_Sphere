import React, { useRef } from 'react';
import { IoCloudUpload, IoClose, IoDocument } from 'react-icons/io5';
import { motion } from 'framer-motion';

const FileUpload = ({
  file,
  onFileChange,
  onRemove,
  accept = '*',
  maxSize = 5,
  label = 'Upload File',
  helperText,
  error,
}) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-700 mb-2">
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${error ? 'border-red-300 bg-red-50' : 'border-primary-300 hover:border-secondary-500 hover:bg-primary-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={onFileChange}
          accept={accept}
          className="hidden"
        />

        {!file ? (
          <div className="flex flex-col items-center">
            <IoCloudUpload className="text-primary-400 mb-2" size={48} />
            <p className="text-sm text-primary-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-primary-500 mt-1">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between bg-white p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <IoDocument className="text-secondary-500" size={32} />
              <div className="text-left">
                <p className="text-sm font-medium text-primary-900">{file.name}</p>
                <p className="text-xs text-primary-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-red-500 hover:text-red-700"
            >
              <IoClose size={24} />
            </button>
          </motion.div>
        )}
      </div>

      {helperText && !error && (
        <p className="mt-1 text-sm text-primary-500">{helperText}</p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
