import express from 'express';
import {
  createApplication,
  getApplicationById,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, checkStudentProfile } from '../middleware/roleMiddleware.js';
import { validate, sanitizeInput } from '../middleware/validationMiddleware.js';
import { createApplicationValidator, applicationIdValidator } from '../validators/applicationValidator.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('student'), checkStudentProfile, sanitizeInput, createApplicationValidator, validate, createApplication);
router.get('/:id', applicationIdValidator, validate, getApplicationById);
router.patch('/:id/withdraw', authorizeRoles('student'), applicationIdValidator, validate, withdrawApplication);

export default router;
