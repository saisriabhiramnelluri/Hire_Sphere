import express from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  uploadPhoto,
  getEligibleDrives,
  getDriveDetails,
  getMyApplications,
  getMyOffers,
  getDashboard,
} from '../controllers/studentController.js';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, checkStudentProfile } from '../middleware/roleMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { validate, sanitizeInput } from '../middleware/validationMiddleware.js';
import { createStudentValidator, updateStudentValidator } from '../validators/userValidator.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.post('/profile', sanitizeInput, createStudentValidator, validate, createProfile);
router.get('/profile', getProfile);
router.patch('/profile', sanitizeInput, updateStudentValidator, validate, updateProfile);

router.post('/resume', uploadLimiter, uploadSingle('resume'), uploadResume);
router.delete('/resume/:resumeId', deleteResume);
router.post('/photo', uploadLimiter, uploadSingle('photo'), uploadPhoto);

router.get('/dashboard', getDashboard);
router.get('/drives', getEligibleDrives);
router.get('/drives/:id', getDriveDetails);
router.get('/applications', getMyApplications);
router.get('/offers', getMyOffers);

router.get('/notifications', getMyNotifications);
router.patch('/notifications/:id/read', markAsRead);
router.patch('/notifications/read-all', markAllAsRead);
router.delete('/notifications/:id', deleteNotification);

export default router;
