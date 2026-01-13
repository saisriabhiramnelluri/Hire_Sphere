import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { createNotification } from '../services/notificationService.js';
import crypto from 'crypto';

// Generate unique room ID
const generateRoomId = () => {
    return crypto.randomBytes(8).toString('hex');
};

// Schedule a new interview
export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, type, title, scheduledAt, duration, panelMembers } = req.body;

        const application = await Application.findById(applicationId)
            .populate('driveId')
            .populate('studentId');

        if (!application) {
            return sendErrorResponse(res, 'Application not found', 404);
        }

        const recruiter = await Recruiter.findOne({ userId: req.user._id });

        if (!recruiter) {
            return sendErrorResponse(res, 'Recruiter profile not found', 404);
        }

        // Generate unique room ID
        const roomId = generateRoomId();

        const interview = await Interview.create({
            applicationId,
            driveId: application.driveId._id,
            studentId: application.studentId._id,
            recruiterId: recruiter._id,
            roomId,
            type,
            title,
            scheduledAt: new Date(scheduledAt),
            duration: duration || 30,
            panelMembers: panelMembers || [],
        });

        // Notify the student with Room ID
        await createNotification({
            recipientId: application.studentId.userId,
            type: 'interview_schedule',
            title: 'Interview Scheduled',
            message: `Your ${type} interview for ${application.driveId.companyName} - ${application.driveId.jobTitle} has been scheduled for ${new Date(scheduledAt).toLocaleString()}. Room ID: ${roomId}`,
            relatedEntity: {
                entityType: 'interview',
                entityId: interview._id,
            },
            priority: 'high',
        });

        const populatedInterview = await Interview.findById(interview._id)
            .populate('applicationId')
            .populate('driveId', 'companyName jobTitle')
            .populate('studentId', 'firstName lastName email');

        sendSuccessResponse(res, 'Interview scheduled successfully', { interview: populatedInterview }, 201);
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get interview by room ID (for joining the room)
export const getInterviewByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const interview = await Interview.findOne({ roomId })
            .populate('applicationId')
            .populate('driveId', 'companyName jobTitle')
            .populate('studentId', 'firstName lastName email userId')
            .populate('recruiterId', 'companyName contactPerson userId');

        if (!interview) {
            return sendErrorResponse(res, 'Interview not found', 404);
        }

        // Verify user is authorized to access this interview
        const isStudent = await Student.findOne({ userId: req.user._id });
        const isRecruiter = await Recruiter.findOne({ userId: req.user._id });

        if (isStudent && interview.studentId._id.toString() !== isStudent._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized access', 403);
        }

        if (isRecruiter && interview.recruiterId._id.toString() !== isRecruiter._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized access', 403);
        }

        sendSuccessResponse(res, 'Interview details fetched', { interview });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get recruiter's scheduled interviews
export const getRecruiterInterviews = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOne({ userId: req.user._id });

        if (!recruiter) {
            return sendErrorResponse(res, 'Recruiter profile not found', 404);
        }

        const { status } = req.query;
        const filter = { recruiterId: recruiter._id };

        if (status) {
            filter.status = status;
        }

        const interviews = await Interview.find(filter)
            .populate('driveId', 'companyName jobTitle')
            .populate('studentId', 'firstName lastName email studentId')
            .sort({ scheduledAt: 1 });

        sendSuccessResponse(res, 'Interviews fetched', { interviews });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get student's scheduled interviews
export const getStudentInterviews = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) {
            return sendErrorResponse(res, 'Student profile not found', 404);
        }

        const { status } = req.query;
        const filter = { studentId: student._id };

        if (status) {
            filter.status = status;
        }

        const interviews = await Interview.find(filter)
            .populate('driveId', 'companyName jobTitle')
            .populate('recruiterId', 'companyName')
            .sort({ scheduledAt: 1 });

        sendSuccessResponse(res, 'Interviews fetched', { interviews });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Update interview status
export const updateInterviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, startedAt, endedAt } = req.body;

        const interview = await Interview.findById(id);

        if (!interview) {
            return sendErrorResponse(res, 'Interview not found', 404);
        }

        if (status) interview.status = status;
        if (startedAt) interview.startedAt = new Date(startedAt);
        if (endedAt) interview.endedAt = new Date(endedAt);

        await interview.save();

        sendSuccessResponse(res, 'Interview status updated', { interview });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Submit interview feedback
export const submitFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, notes, recommendation } = req.body;

        const interview = await Interview.findById(id);

        if (!interview) {
            return sendErrorResponse(res, 'Interview not found', 404);
        }

        interview.feedback = {
            rating,
            notes,
            recommendation,
            submittedAt: new Date(),
        };

        if (interview.status === 'ongoing') {
            interview.status = 'completed';
            interview.endedAt = new Date();
        }

        await interview.save();

        sendSuccessResponse(res, 'Feedback submitted successfully', { interview });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const interview = await Interview.findById(id)
            .populate('studentId', 'userId')
            .populate('driveId', 'companyName jobTitle');

        if (!interview) {
            return sendErrorResponse(res, 'Interview not found', 404);
        }

        interview.status = 'cancelled';
        await interview.save();

        // Notify student about cancellation
        await createNotification({
            recipientId: interview.studentId.userId,
            type: 'interview_schedule',
            title: 'Interview Cancelled',
            message: `Your ${interview.type} interview for ${interview.driveId.companyName} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
            priority: 'high',
        });

        sendSuccessResponse(res, 'Interview cancelled', { interview });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get interviews for a specific application
export const getApplicationInterviews = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const interviews = await Interview.find({ applicationId })
            .sort({ scheduledAt: -1 });

        sendSuccessResponse(res, 'Application interviews fetched', { interviews });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};
