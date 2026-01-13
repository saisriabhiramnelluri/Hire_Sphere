import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
    },
    resumeUsed: {
      title: String,
      url: String,
    },
    coverLetter: {
      type: String,
      maxlength: 2000,
    },
    status: {
      type: String,
      default: 'applied',
      // Status is now dynamic based on drive's selectionProcess
      // Core statuses: applied, rejected, offered, withdrawn
      // Pipeline stages are added dynamically from the drive
    },
    currentStageIndex: {
      type: Number,
      default: 0,
      // Tracks which stage in the pipeline the applicant is at
    },
    rejectedAtStage: {
      type: String,
      // If rejected, stores the stage name where rejection occurred
    },
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        remarks: String,
      },
    ],
    testDetails: {
      scheduledDate: Date,
      score: Number,
      maxScore: Number,
      feedback: String,
    },
    interviewDetails: [
      {
        round: String,
        scheduledDate: Date,
        interviewerName: String,
        feedback: String,
        result: {
          type: String,
          enum: ['pending', 'cleared', 'rejected'],
          default: 'pending',
        },
      },
    ],
    recruiterNotes: {
      type: String,
      maxlength: 1000,
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    ineligibilityReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });
applicationSchema.index({ driveId: 1, status: 1 });
applicationSchema.index({ studentId: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
