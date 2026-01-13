import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: 5000,
    },
    jobType: {
      type: String,
      enum: ['full_time', 'internship', 'both'],
      required: true,
    },
    jobLocation: {
      type: String,
      required: true,
    },
    workMode: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      default: 'onsite',
    },
    ctc: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    stipend: {
      amount: Number,
      duration: String,
    },
    eligibilityCriteria: {
      branches: {
        type: [String],
        required: true,
      },
      minCGPA: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
      },
      maxBacklogs: {
        type: Number,
        default: 0,
      },
      allowedBatches: {
        type: [Number],
        required: true,
      },
      minTenthMarks: {
        type: Number,
        default: 0,
      },
      minTwelfthMarks: {
        type: Number,
        default: 0,
      },
    },
    selectionProcess: [
      {
        stage: {
          type: String,
          trim: true,
        },
        description: String,
        scheduledDate: Date,
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    skillsRequired: [String],
    positions: {
      type: Number,
      required: [true, 'Number of positions is required'],
      min: 1,
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    driveDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'ongoing', 'closed'],
      default: 'pending',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    attachments: [
      {
        title: String,
        url: String,
        publicId: String,
      },
    ],
    statistics: {
      totalApplications: {
        type: Number,
        default: 0,
      },
      shortlisted: {
        type: Number,
        default: 0,
      },
      offered: {
        type: Number,
        default: 0,
      },
      accepted: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

driveSchema.index({ recruiterId: 1 });
driveSchema.index({ status: 1, isApproved: 1 });
driveSchema.index({ applicationDeadline: 1 });

const Drive = mongoose.model('Drive', driveSchema);

export default Drive;
