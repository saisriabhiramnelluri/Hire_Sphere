import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import studentRoutes from './studentRoutes.js';
import recruiterRoutes from './recruiterRoutes.js';
import driveRoutes from './driveRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import offerRoutes from './offerRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import testRoutes from './testRoutes.js';
import submissionRoutes from './submissionRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/drives', driveRoutes);
router.use('/applications', applicationRoutes);
router.use('/offers', offerRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/tests', testRoutes);
router.use('/submissions', submissionRoutes);

export default router;

