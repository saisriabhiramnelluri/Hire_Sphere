import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      maxlength: 1000,
    },
    companyLogo: {
      url: String,
      publicId: String,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
    },
    companySize: {
      type: String,
      enum: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    headquarters: {
      city: String,
      state: String,
      country: String,
    },
    contactPerson: {
      firstName: {
        type: String,
        required: [true, 'Contact person first name is required'],
      },
      lastName: {
        type: String,
        required: [true, 'Contact person last name is required'],
      },
      designation: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
      },
      alternateEmail: {
        type: String,
        lowercase: true,
        trim: true,
      },
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
    documents: [
      {
        title: String,
        url: String,
        publicId: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

recruiterSchema.index({ userId: 1 });
recruiterSchema.index({ companyName: 1 });

const Recruiter = mongoose.model('Recruiter', recruiterSchema);

export default Recruiter;
