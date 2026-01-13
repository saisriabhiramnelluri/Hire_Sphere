import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload IMAGES to Cloudinary (logos, profile pics, etc.)
 * Uses 'auto' resource type - suitable for images
 */
export const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `hiresphere/${folder}`,
      resource_type: 'auto',
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload DOCUMENTS to Cloudinary (PDFs, DOCs, etc.)
 * Uses 'raw' resource type - required for non-media files
 * Returns a direct download URL that works without errors
 */
export const uploadDocumentToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `hiresphere/${folder}`,
      resource_type: 'raw', // IMPORTANT: 'raw' for PDFs and documents
    });

    // The secure_url from raw uploads works directly for download
    return {
      public_id: result.public_id,
      url: result.secure_url, // This is the direct download URL for raw files
      resource_type: 'raw',
    };
  } catch (error) {
    throw new Error(`Cloudinary document upload failed: ${error.message}`);
  }
};

/**
 * Delete an IMAGE from Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

/**
 * Delete a DOCUMENT from Cloudinary
 * Must specify resource_type: 'raw' for documents
 */
export const deleteDocumentFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    return true;
  } catch (error) {
    throw new Error(`Cloudinary document deletion failed: ${error.message}`);
  }
};

export default cloudinary;
