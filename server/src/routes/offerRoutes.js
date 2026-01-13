import express from 'express';
import {
  getOfferById,
  respondToOffer,
  uploadJoiningConfirmation,
} from '../controllers/offerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:id', getOfferById);
router.patch('/:id/respond', authorizeRoles('student'), respondToOffer);
router.post('/:id/joining-confirmation', authorizeRoles('student'), uploadLimiter, uploadSingle('document'), uploadJoiningConfirmation);

export default router;
