import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    email: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    profilePhoto: {
      url: String,
      publicId: String,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
    },
    batch: {
      type: Number,
      required: [true, 'Batch year is required'],
    },
    currentSemester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: 0,
      max: 10,
    },
    tenthMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    twelfthMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    resumes: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        // Firebase Storage path for new uploads
        fileName: {
          type: String,
        },
        // Cloudinary publicId for legacy uploads
        publicId: {
          type: String,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    placementStatus: {
      isPlaced: {
        type: Boolean,
        default: false,
      },
      placedCompany: {
        type: String,
      },
      placedCTC: {
        type: Number,
      },
      placedJobType: {
        type: String,
        enum: ['full_time', 'internship'],
      },
      placedDate: {
        type: Date,
      },
      offerLetterUrl: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ userId: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ batch: 1, branch: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
