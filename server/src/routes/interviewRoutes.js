import express from 'express';
import {
    scheduleInterview,
    getInterviewByRoom,
    getRecruiterInterviews,
    getStudentInterviews,
    updateInterviewStatus,
    submitFeedback,
    cancelInterview,
    getApplicationInterviews,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Get interview by room ID (for joining) - accessible by student and recruiter
router.get('/room/:roomId', getInterviewByRoom);

// Recruiter routes
router.post('/', authorizeRoles('recruiter'), scheduleInterview);
router.get('/recruiter', authorizeRoles('recruiter'), getRecruiterInterviews);
router.get('/application/:applicationId', authorizeRoles('recruiter'), getApplicationInterviews);
router.patch('/:id/status', authorizeRoles('recruiter'), updateInterviewStatus);
router.post('/:id/feedback', authorizeRoles('recruiter'), submitFeedback);
router.patch('/:id/cancel', authorizeRoles('recruiter'), cancelInterview);

// Student routes
router.get('/student', authorizeRoles('student'), getStudentInterviews);

export default router;
