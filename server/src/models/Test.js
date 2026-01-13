import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
    {
        // Basic info
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        instructions: {
            type: String,
        },

        // Test type
        type: {
            type: String,
            enum: ['aptitude', 'technical', 'mixed'],
            required: true,
        },

        // Associated drive (optional - can be standalone)
        driveId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Drive',
        },

        // Created by
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recruiter',
            required: true,
        },

        // Test configuration
        duration: {
            type: Number, // Duration in minutes
            required: true,
            default: 60,
        },
        totalMarks: {
            type: Number,
            default: 100,
        },
        passingPercentage: {
            type: Number,
            default: 50,
        },

        // Questions
        questions: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                },
                order: Number,
                points: Number, // Override default points
            },
        ],

        // For inline questions (not from question bank)
        inlineQuestions: [
            {
                type: {
                    type: String,
                    enum: ['mcq', 'coding'],
                },
                title: String,
                question: String,
                options: [
                    {
                        text: String,
                        isCorrect: Boolean,
                    },
                ],
                problemStatement: String,
                sampleInput: String,
                sampleOutput: String,
                testCases: [
                    {
                        input: String,
                        expectedOutput: String,
                        isHidden: Boolean,
                        points: Number,
                    },
                ],
                points: { type: Number, default: 1 },
                order: Number,
            },
        ],

        // Settings
        settings: {
            shuffleQuestions: { type: Boolean, default: false },
            shuffleOptions: { type: Boolean, default: false },
            showResults: { type: Boolean, default: true },
            allowReview: { type: Boolean, default: false },
            preventTabSwitch: { type: Boolean, default: true },
            webcamRequired: { type: Boolean, default: false },
        },

        // Status
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },

        // Statistics (updated after submissions)
        statistics: {
            totalAttempts: { type: Number, default: 0 },
            averageScore: { type: Number, default: 0 },
            highestScore: { type: Number, default: 0 },
            lowestScore: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
testSchema.index({ recruiterId: 1, status: 1 });
testSchema.index({ driveId: 1 });
testSchema.index({ type: 1 });

const Test = mongoose.model('Test', testSchema);

export default Test;
