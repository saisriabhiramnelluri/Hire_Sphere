import express from 'express';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/file', protect, uploadLimiter, uploadSingle('file'), async (req, res) => {
  try {
    if (!req.file) {
      return sendErrorResponse(res, 'No file uploaded', 400);
    }

    const { folder } = req.body;
    const uploadResult = await uploadToCloudinary(req.file.path, folder || 'documents');

    sendSuccessResponse(res, 'File uploaded successfully', {
      url: uploadResult.url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
});

export default router;
