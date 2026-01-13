import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    fileType: {
      type: String,
      enum: ['resume', 'offer_letter', 'document'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['drive', 'application', 'offer', 'student', 'recruiter'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    accessControl: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowedRoles: [String],
      allowedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ fileType: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
