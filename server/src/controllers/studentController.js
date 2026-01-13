import Student from '../models/Student.js';
import Drive from '../models/Drive.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { uploadToFirebase, deleteFromFirebase } from '../config/firebase.js';
import { checkEligibility } from '../services/eligibilityService.js';

export const createProfile = async (req, res) => {
  try {
    const existingProfile = await Student.findOne({ userId: req.user._id });
    if (existingProfile) {
      return sendErrorResponse(res, 'Profile already exists', 400);
    }

    const student = await Student.create({
      userId: req.user._id,
      ...req.body,
    });

    sendSuccessResponse(res, 'Profile created successfully', { student }, 201);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    sendSuccessResponse(res, 'Profile fetched successfully', { student });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    sendSuccessResponse(res, 'Profile updated successfully', { student });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return sendErrorResponse(res, 'Please upload a file', 400);
    }

    const { title, isDefault } = req.body;

    // Upload resume to Firebase Storage
    const uploadResult = await uploadToFirebase(req.file.path, 'resumes');

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    if (isDefault === 'true') {
      student.resumes.forEach((resume) => {
        resume.isDefault = false;
      });
    }

    student.resumes.push({
      title: title || req.file.originalname,
      url: uploadResult.url,
      fileName: uploadResult.fileName, // Firebase Storage path
      isDefault: isDefault === 'true',
    });

    await student.save();

    sendSuccessResponse(res, 'Resume uploaded successfully', { student });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    const resume = student.resumes.id(resumeId);

    if (!resume) {
      return sendErrorResponse(res, 'Resume not found', 404);
    }

    // Delete from Firebase Storage (if fileName exists) or Cloudinary (for old uploads)
    if (resume.fileName) {
      await deleteFromFirebase(resume.fileName);
    } else if (resume.publicId) {
      await deleteFromCloudinary(resume.publicId);
    }

    student.resumes.pull(resumeId);
    await student.save();

    sendSuccessResponse(res, 'Resume deleted successfully', { student });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return sendErrorResponse(res, 'Please upload an image', 400);
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    // Delete old photo if exists
    if (student.profilePhoto?.publicId) {
      await deleteFromCloudinary(student.profilePhoto.publicId);
    }

    // Upload new photo to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, 'student-photos');

    student.profilePhoto = {
      url: uploadResult.url,
      publicId: uploadResult.public_id,
    };

    await student.save();

    sendSuccessResponse(res, 'Profile photo uploaded successfully', { student });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getEligibleDrives = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    const { page = 1, limit = 10 } = req.query;

    const drives = await Drive.find({
      status: 'published',
      isApproved: true,
      'eligibilityCriteria.branches': student.branch,
      'eligibilityCriteria.allowedBatches': student.batch,
      'eligibilityCriteria.minCGPA': { $lte: student.cgpa },
      'eligibilityCriteria.maxBacklogs': { $gte: student.activeBacklogs },
      applicationDeadline: { $gte: new Date() },
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Drive.countDocuments({
      status: 'published',
      isApproved: true,
      'eligibilityCriteria.branches': student.branch,
      'eligibilityCriteria.allowedBatches': student.batch,
      'eligibilityCriteria.minCGPA': { $lte: student.cgpa },
      'eligibilityCriteria.maxBacklogs': { $gte: student.activeBacklogs },
      applicationDeadline: { $gte: new Date() },
    });

    sendSuccessResponse(res, 'Eligible drives fetched successfully', {
      drives,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalDrives: count,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getDriveDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await Drive.findById(id).populate('recruiterId', 'companyName companyWebsite');

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    const student = await Student.findOne({ userId: req.user._id });
    const eligibility = checkEligibility(student, drive);

    const existingApplication = await Application.findOne({
      studentId: student._id,
      driveId: drive._id,
    });

    sendSuccessResponse(res, 'Drive details fetched successfully', {
      drive,
      eligibility,
      hasApplied: !!existingApplication,
      application: existingApplication,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { studentId: student._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('driveId', 'companyName jobTitle jobLocation ctc applicationDeadline selectionProcess')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    sendSuccessResponse(res, 'Applications fetched successfully', {
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalApplications: count,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getMyOffers = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    const offers = await Offer.find({ studentId: student._id, isActive: true })
      .populate('driveId', 'companyName jobTitle')
      .populate('recruiterId', 'companyName')
      .sort({ createdAt: -1 });

    sendSuccessResponse(res, 'Offers fetched successfully', { offers });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    const totalApplications = await Application.countDocuments({ studentId: student._id });
    const shortlisted = await Application.countDocuments({ studentId: student._id, status: 'shortlisted' });
    const offered = await Application.countDocuments({ studentId: student._id, status: 'offered' });

    const recentApplications = await Application.find({ studentId: student._id })
      .populate('driveId', 'companyName jobTitle')
      .sort({ createdAt: -1 })
      .limit(5);

    const eligibleDrivesCount = await Drive.countDocuments({
      status: 'published',
      isApproved: true,
      'eligibilityCriteria.branches': student.branch,
      'eligibilityCriteria.allowedBatches': student.batch,
      'eligibilityCriteria.minCGPA': { $lte: student.cgpa },
      applicationDeadline: { $gte: new Date() },
    });

    sendSuccessResponse(res, 'Dashboard data fetched successfully', {
      stats: {
        totalApplications,
        shortlisted,
        offered,
        eligibleDrives: eligibleDrivesCount,
      },
      recentApplications,
      placementStatus: student.placementStatus,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
