import { useState } from 'react';
import toast from 'react-hot-toast';

export const useFileUpload = (options = {}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    onUpload,
  } = options;

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setError('Please select a file');
      return false;
    }

    if (selectedFile.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`File size must be less than ${maxSizeMB}MB`);
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type');
      toast.error('Invalid file type');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }

    if (!validateFile(selectedFile)) {
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setError(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError('No file selected');
      return null;
    }

    try {
      setUploading(true);
      setError(null);

      const result = await onUpload(file);
      
      toast.success('File uploaded successfully');
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'File upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploading(false);
  };

  return {
    file,
    preview,
    uploading,
    error,
    handleFileChange,
    uploadFile,
    reset,
  };
};
