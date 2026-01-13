import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  getPendingRecruiterApprovals,
  approveRecruiter,
  rejectRecruiter,
  getPendingDriveApprovals,
  approveDrive,
  rejectDrive,
  getPlacementAnalytics,
} from '../controllers/adminController.js';
import {
  getOverallAnalytics,
  getBranchWiseAnalytics,
  getCompanyWiseAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { sanitizeInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users', sanitizeInput, createUser);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/recruiters/pending', getPendingRecruiterApprovals);
router.patch('/recruiters/:id/approve', approveRecruiter);
router.patch('/recruiters/:id/reject', sanitizeInput, rejectRecruiter);

router.get('/drives/pending', getPendingDriveApprovals);
router.patch('/drives/:id/approve', approveDrive);
router.patch('/drives/:id/reject', sanitizeInput, rejectDrive);

router.get('/analytics/placement', getPlacementAnalytics);
router.get('/analytics/overall', getOverallAnalytics);
router.get('/analytics/branch-wise', getBranchWiseAnalytics);
router.get('/analytics/company-wise', getCompanyWiseAnalytics);

export default router;
