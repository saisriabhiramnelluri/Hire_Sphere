import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
        },
        driveId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Drive',
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recruiter',
            required: true,
        },
        // Unique room identifier for the interview
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
        // Interview type
        type: {
            type: String,
            enum: ['hr', 'technical', 'managerial', 'final'],
            required: true,
        },
        // Title for the interview
        title: {
            type: String,
            required: true,
            trim: true,
        },
        // Scheduled date and time
        scheduledAt: {
            type: Date,
            required: true,
        },
        // Duration in minutes
        duration: {
            type: Number,
            default: 30,
        },
        // Interview status
        status: {
            type: String,
            enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
            default: 'scheduled',
        },
        // Panel interviewers (for technical/panel interviews)
        panelMembers: [
            {
                name: String,
                email: String,
                designation: String,
            },
        ],
        // Interview notes/feedback
        feedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            notes: String,
            recommendation: {
                type: String,
                enum: ['strongly_hire', 'hire', 'neutral', 'no_hire', 'strongly_no_hire'],
            },
            submittedAt: Date,
        },
        // Interview recording URL (optional, for future)
        recordingUrl: String,
        // Timestamps for actual interview
        startedAt: Date,
        endedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes
interviewSchema.index({ roomId: 1 });
interviewSchema.index({ applicationId: 1 });
interviewSchema.index({ scheduledAt: 1, status: 1 });
interviewSchema.index({ recruiterId: 1, status: 1 });
interviewSchema.index({ studentId: 1, status: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
