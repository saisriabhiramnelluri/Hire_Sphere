import express from 'express';
import {
    getStudentTests,
    startTest,
    submitMcqAnswer,
    runCode,
    submitCode,
    finalizeTest,
    getSubmissionReport,
    recordProctoringEvent,
    getDetailedPerformanceReport,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Student routes
router.get('/student', authorizeRoles('student'), getStudentTests);
router.post('/start/:submissionId', authorizeRoles('student'), startTest);
router.post('/:submissionId/answer', authorizeRoles('student'), submitMcqAnswer);
router.post('/run-code', authorizeRoles('student'), runCode);
router.post('/:submissionId/code', authorizeRoles('student'), submitCode);
router.post('/:submissionId/finalize', authorizeRoles('student'), finalizeTest);
router.post('/:submissionId/proctoring', authorizeRoles('student'), recordProctoringEvent);

// Report (accessible by both)
router.get('/:submissionId/report', getSubmissionReport);

// Recruiter routes
router.get('/:submissionId/performance-report', authorizeRoles('recruiter'), getDetailedPerformanceReport);

export default router;
