import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

export const uploadFile = async (filePath, folder) => {
  try {
    const result = await uploadToCloudinary(filePath, folder);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return result;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`File upload failed: ${error.message}`);
  }
};

export const deleteFile = async (publicId) => {
  try {
    await deleteFromCloudinary(publicId);
    return true;
  } catch (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

export const validateFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

export const validateFileSize = (size, maxSize) => {
  return size <= maxSize;
};
