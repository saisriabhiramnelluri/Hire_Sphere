import Test from '../models/Test.js';
import TestSubmission from '../models/TestSubmission.js';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { createNotification } from '../services/notificationService.js';
import { generateQuestions } from '../services/aiService.js';

// Create a new test
export const createTest = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (!recruiter) {
            return sendErrorResponse(res, 'Recruiter profile not found', 404);
        }

        const testData = {
            ...req.body,
            recruiterId: recruiter._id,
        };

        const test = await Test.create(testData);

        sendSuccessResponse(res, 'Test created successfully', { test }, 201);
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Update test
export const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id);

        if (!test) {
            return sendErrorResponse(res, 'Test not found', 404);
        }

        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (test.recruiterId.toString() !== recruiter._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized', 403);
        }

        Object.assign(test, req.body);
        await test.save();

        sendSuccessResponse(res, 'Test updated successfully', { test });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Delete test
export const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id);

        if (!test) {
            return sendErrorResponse(res, 'Test not found', 404);
        }

        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (test.recruiterId.toString() !== recruiter._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized', 403);
        }

        await Test.findByIdAndDelete(id);
        sendSuccessResponse(res, 'Test deleted successfully');
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get test by ID
export const getTestById = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id)
            .populate('driveId', 'companyName jobTitle');

        if (!test) {
            return sendErrorResponse(res, 'Test not found', 404);
        }

        sendSuccessResponse(res, 'Test fetched successfully', { test });
    } catch (error) {
        console.error('getTestById error:', error);
        sendErrorResponse(res, error.message, 500);
    }
};

// Get recruiter's tests
export const getRecruiterTests = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (!recruiter) {
            return sendErrorResponse(res, 'Recruiter profile not found', 404);
        }

        const { status, type } = req.query;
        const filter = { recruiterId: recruiter._id };

        if (status) filter.status = status;
        if (type) filter.type = type;

        const tests = await Test.find(filter)
            .populate('driveId', 'companyName jobTitle')
            .sort({ createdAt: -1 });

        sendSuccessResponse(res, 'Tests fetched successfully', { tests });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Schedule test for an applicant
export const scheduleTest = async (req, res) => {
    try {
        const { testId, applicationId, scheduledAt, expiresAt } = req.body;

        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (!recruiter) {
            return sendErrorResponse(res, 'Recruiter profile not found', 404);
        }

        const test = await Test.findById(testId);
        if (!test) {
            return sendErrorResponse(res, 'Test not found', 404);
        }

        const application = await Application.findById(applicationId)
            .populate('studentId')
            .populate('driveId');

        if (!application) {
            return sendErrorResponse(res, 'Application not found', 404);
        }

        // Check if already scheduled
        const existingSubmission = await TestSubmission.findOne({
            testId,
            studentId: application.studentId._id,
        });

        if (existingSubmission) {
            return sendErrorResponse(res, 'Test already scheduled for this student', 400);
        }

        // Create submission record
        const submission = await TestSubmission.create({
            testId,
            studentId: application.studentId._id,
            applicationId,
            scheduledBy: recruiter._id,
            scheduledAt: new Date(scheduledAt),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            status: 'scheduled',
            scores: {
                maxScore: test.totalMarks,
            },
        });

        // Notify student
        await createNotification({
            recipientId: application.studentId.userId,
            type: 'test_schedule',
            title: 'Test Scheduled',
            message: `You have been scheduled for "${test.title}" (${test.type}) for ${application.driveId.companyName}. Scheduled: ${new Date(scheduledAt).toLocaleString()}. Duration: ${test.duration} minutes.`,
            relatedEntity: {
                entityType: 'test',
                entityId: submission._id,
            },
            priority: 'high',
        });

        const populatedSubmission = await TestSubmission.findById(submission._id)
            .populate('testId', 'title type duration')
            .populate('studentId', 'firstName lastName email');

        sendSuccessResponse(res, 'Test scheduled successfully', { submission: populatedSubmission }, 201);
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get test submissions (for recruiter)
export const getTestSubmissions = async (req, res) => {
    try {
        const { testId } = req.params;

        const submissions = await TestSubmission.find({ testId })
            .populate('studentId', 'firstName lastName email studentId')
            .populate('applicationId')
            .sort({ submittedAt: -1 });

        sendSuccessResponse(res, 'Submissions fetched', { submissions });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Publish test
export const publishTest = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id);

        if (!test) {
            return sendErrorResponse(res, 'Test not found', 404);
        }

        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (test.recruiterId.toString() !== recruiter._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized', 403);
        }

        // Validate test has at least one question
        if (test.inlineQuestions.length === 0 && test.questions.length === 0) {
            return sendErrorResponse(res, 'Test must have at least one question', 400);
        }

        test.status = 'published';
        await test.save();

        sendSuccessResponse(res, 'Test published successfully', { test });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Assign test to applicants (by application IDs)
export const assignTestToApplicants = async (req, res) => {
    try {
        const { testId, applicationIds, scheduledAt, expiresAt } = req.body;

        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (!recruiter) {
            return sendErrorResponse(res, 'Recruiter profile not found', 404);
        }

        const test = await Test.findById(testId);
        if (!test) {
            return sendErrorResponse(res, 'Test not found', 404);
        }

        if (test.status !== 'published') {
            return sendErrorResponse(res, 'Test must be published before assigning', 400);
        }

        let successCount = 0;
        let failCount = 0;

        console.log('assignTestToApplicants - applicationIds:', applicationIds);

        for (const applicationId of applicationIds) {
            try {
                console.log('Processing applicationId:', applicationId);

                const application = await Application.findById(applicationId)
                    .populate('studentId')
                    .populate('driveId');

                console.log('Application found:', application ? 'yes' : 'no');
                console.log('StudentId:', application?.studentId?._id);

                if (!application || !application.studentId) {
                    console.log('No application or studentId - failing');
                    failCount++;
                    continue;
                }

                // Check if already scheduled
                const existingSubmission = await TestSubmission.findOne({
                    testId,
                    studentId: application.studentId._id,
                });

                console.log('Existing submission:', existingSubmission ? 'yes' : 'no');

                if (existingSubmission) {
                    console.log('Already scheduled - failing');
                    failCount++;
                    continue;
                }

                console.log('Creating submission...');

                // Create submission record
                const submission = await TestSubmission.create({
                    testId,
                    studentId: application.studentId._id,
                    applicationId,
                    scheduledBy: recruiter._id,
                    scheduledAt: new Date(scheduledAt),
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    status: 'scheduled',
                    scores: {
                        maxScore: test.totalMarks,
                    },
                });

                console.log('Submission created:', submission._id);

                // Notify student
                await createNotification({
                    recipientId: application.studentId.userId,
                    type: 'test_schedule',
                    title: 'Test Scheduled',
                    message: `You have been scheduled for "${test.title}" (${test.type}) for ${application.driveId?.jobTitle || 'a position'}. Scheduled: ${new Date(scheduledAt).toLocaleString()}. Duration: ${test.duration} minutes.`,
                    relatedEntity: {
                        entityType: 'test',
                        entityId: submission._id,
                    },
                    priority: 'high',
                });

                console.log('Notification sent - success!');
                successCount++;
            } catch (err) {
                console.error(`Error assigning test to application ${applicationId}:`, err);
                failCount++;
            }
        }

        sendSuccessResponse(res, 'Test assignment completed', {
            successCount,
            failCount,
            totalApplications: applicationIds.length,
        });
    } catch (error) {
        console.error('assignTestToApplicants error:', error);
        sendErrorResponse(res, error.message, 500);
    }
};

// Generate questions using AI
export const generateAIQuestions = async (req, res) => {
    try {
        const { jobDescription, difficultyLevel, questionCount, questionType } = req.body;

        // Validate inputs
        if (!jobDescription || !jobDescription.trim()) {
            return sendErrorResponse(res, 'Job description is required', 400);
        }

        if (!['easy', 'medium', 'hard'].includes(difficultyLevel)) {
            return sendErrorResponse(res, 'Invalid difficulty level', 400);
        }

        if (!['mcq', 'coding'].includes(questionType)) {
            return sendErrorResponse(res, 'Invalid question type', 400);
        }

        const count = Math.min(Math.max(parseInt(questionCount) || 5, 1), 10);

        const questions = await generateQuestions(
            jobDescription,
            difficultyLevel,
            count,
            questionType
        );

        sendSuccessResponse(res, 'Questions generated successfully', { questions });
    } catch (error) {
        console.error('generateAIQuestions error:', error);
        sendErrorResponse(res, error.message || 'Failed to generate questions', 500);
    }
};
