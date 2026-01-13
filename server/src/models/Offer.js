import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
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
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: true,
    },
    offerDetails: {
      designation: {
        type: String,
        required: true,
      },
      ctc: {
        type: Number,
        required: true,
      },
      joiningDate: {
        type: Date,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      bondDuration: {
        type: Number,
        default: 0,
      },
      benefits: [String],
    },
    offerLetter: {
      url: {
        type: String,
        required: true,
      },
      // Firebase Storage path for deletion
      fileName: {
        type: String,
      },
      // Keep for backward compatibility
      viewUrl: {
        type: String,
      },
      fileId: {
        type: String,
      },
      publicId: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    studentResponse: {
      decision: {
        type: String,
        enum: ['accepted', 'rejected'],
      },
      respondedAt: Date,
      remarks: String,
    },
    joiningConfirmation: {
      isConfirmed: {
        type: Boolean,
        default: false,
      },
      documentUrl: String,
      publicId: String,
      confirmedAt: Date,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ studentId: 1 });
offerSchema.index({ driveId: 1 });
offerSchema.index({ applicationId: 1 }, { unique: true });
offerSchema.index({ status: 1, isActive: 1 });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
