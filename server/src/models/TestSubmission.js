import mongoose from 'mongoose';

const testSubmissionSchema = new mongoose.Schema(
    {
        // References
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Test',
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        },

        // Scheduling
        scheduledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recruiter',
        },
        scheduledAt: {
            type: Date,
        },
        expiresAt: {
            type: Date, // Deadline to take the test
        },

        // Timing
        startedAt: {
            type: Date,
        },
        submittedAt: {
            type: Date,
        },
        timeSpent: {
            type: Number, // Time spent in seconds
            default: 0,
        },

        // Status
        status: {
            type: String,
            enum: ['scheduled', 'in_progress', 'submitted', 'evaluated', 'expired'],
            default: 'scheduled',
        },

        // MCQ Answers
        mcqAnswers: [
            {
                questionIndex: Number, // Index in test questions array
                selectedOption: Number, // Index of selected option
                isCorrect: Boolean,
                pointsEarned: { type: Number, default: 0 },
                answeredAt: Date,
            },
        ],

        // Code Submissions
        codeSubmissions: [
            {
                questionIndex: Number,
                language: {
                    type: String,
                    enum: ['python', 'javascript', 'java', 'cpp', 'c'],
                },
                code: String,
                testCaseResults: [
                    {
                        testCaseIndex: Number,
                        passed: Boolean,
                        actualOutput: String,
                        expectedOutput: String,
                        executionTime: Number, // in ms
                        memoryUsed: Number, // in KB
                        error: String,
                    },
                ],
                totalPassed: { type: Number, default: 0 },
                totalTestCases: { type: Number, default: 0 },
                pointsEarned: { type: Number, default: 0 },
                submittedAt: Date,
            },
        ],

        // Scores
        scores: {
            mcqScore: { type: Number, default: 0 },
            mcqTotal: { type: Number, default: 0 },
            codingScore: { type: Number, default: 0 },
            codingTotal: { type: Number, default: 0 },
            totalScore: { type: Number, default: 0 },
            maxScore: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
            passed: { type: Boolean, default: false },
        },

        // Proctoring data (optional)
        proctoring: {
            tabSwitchCount: { type: Number, default: 0 },
            warningsIssued: { type: Number, default: 0 },
            flagged: { type: Boolean, default: false },
            flagReason: String,
        },

        // Recruiter review
        review: {
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recruiter',
            },
            reviewedAt: Date,
            comments: String,
            decision: {
                type: String,
                enum: ['pending', 'passed', 'failed'],
                default: 'pending',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
testSubmissionSchema.index({ testId: 1, studentId: 1 }, { unique: true });
testSubmissionSchema.index({ studentId: 1, status: 1 });
testSubmissionSchema.index({ testId: 1, status: 1 });
testSubmissionSchema.index({ scheduledAt: 1 });

const TestSubmission = mongoose.model('TestSubmission', testSubmissionSchema);

export default TestSubmission;
