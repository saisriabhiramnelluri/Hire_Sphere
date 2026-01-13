import express from 'express';
import { getAllDrives, getDriveById, getDriveStatistics } from '../controllers/driveController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { driveIdValidator } from '../validators/driveValidator.js';

const router = express.Router();

router.get('/', optionalAuth, getAllDrives);
router.get('/:id', driveIdValidator, validate, getDriveById);
router.get('/:id/statistics', protect, getDriveStatistics);

export default router;
