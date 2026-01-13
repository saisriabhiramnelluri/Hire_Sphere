import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
    {
        // Question type
        type: {
            type: String,
            enum: ['mcq', 'coding'],
            required: true,
        },

        // Common fields
        title: {
            type: String,
            required: true,
            trim: true,
        },
        points: {
            type: Number,
            default: 1,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },

        // MCQ specific fields
        question: {
            type: String, // The actual question text
        },
        options: [
            {
                text: String,
                isCorrect: Boolean,
            },
        ],

        // Coding specific fields
        problemStatement: {
            type: String, // Detailed problem description
        },
        constraints: {
            type: String, // Input constraints
        },
        sampleInput: {
            type: String,
        },
        sampleOutput: {
            type: String,
        },
        explanation: {
            type: String, // Explanation for sample output
        },
        testCases: [
            {
                input: String,
                expectedOutput: String,
                isHidden: { type: Boolean, default: false },
                points: { type: Number, default: 1 },
            },
        ],
        supportedLanguages: [
            {
                type: String,
                enum: ['python', 'javascript', 'java', 'cpp', 'c'],
            },
        ],
        timeLimit: {
            type: Number, // Time limit in seconds for code execution
            default: 2,
        },
        memoryLimit: {
            type: Number, // Memory limit in MB
            default: 256,
        },

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recruiter',
        },
        tags: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
questionSchema.index({ type: 1, difficulty: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ tags: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
