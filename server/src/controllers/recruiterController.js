import Recruiter from '../models/Recruiter.js';
import Drive from '../models/Drive.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { uploadToFirebase } from '../config/firebase.js';
import { createNotification } from '../services/notificationService.js';

export const createProfile = async (req, res) => {
  try {
    const existingProfile = await Recruiter.findOne({ userId: req.user._id });
    if (existingProfile) {
      return sendErrorResponse(res, 'Profile already exists', 400);
    }

    const recruiter = await Recruiter.create({
      userId: req.user._id,
      ...req.body,
    });

    sendSuccessResponse(res, 'Profile created successfully. Awaiting admin approval.', { recruiter }, 201);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (!recruiter) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    sendSuccessResponse(res, 'Profile fetched successfully', { recruiter });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!recruiter) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    sendSuccessResponse(res, 'Profile updated successfully', { recruiter });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return sendErrorResponse(res, 'Please upload a file', 400);
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (!recruiter) {
      return sendErrorResponse(res, 'Profile not found', 404);
    }

    if (recruiter.companyLogo?.publicId) {
      await deleteFromCloudinary(recruiter.companyLogo.publicId);
    }

    const uploadResult = await uploadToCloudinary(req.file.path, 'company-logos');

    recruiter.companyLogo = {
      url: uploadResult.url,
      publicId: uploadResult.public_id,
    };

    await recruiter.save();

    sendSuccessResponse(res, 'Company logo uploaded successfully', { recruiter });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const createDrive = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (!recruiter) {
      return sendErrorResponse(res, 'Recruiter profile not found', 404);
    }

    if (!recruiter.isApproved) {
      return sendErrorResponse(res, 'Your account is not approved yet', 403);
    }

    const drive = await Drive.create({
      recruiterId: recruiter._id,
      ...req.body,
    });

    // Notify all admins about the new drive pending approval
    const adminUsers = await User.find({ role: 'admin', isActive: true });
    for (const admin of adminUsers) {
      await createNotification({
        recipientId: admin._id,
        type: 'drive_approval_pending',
        title: 'New Drive Pending Approval',
        message: `${recruiter.companyName} has submitted a new drive for "${drive.jobTitle}" requiring approval.`,
        relatedEntity: {
          entityType: 'drive',
          entityId: drive._id,
        },
        priority: 'high',
        actionUrl: '/admin/drives',
      });
    }

    sendSuccessResponse(res, 'Drive created successfully. Awaiting admin approval.', { drive }, 201);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getMyDrives = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (!recruiter) {
      return sendErrorResponse(res, 'Recruiter profile not found', 404);
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { recruiterId: recruiter._id };
    if (status) query.status = status;

    const drives = await Drive.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get application counts for all drives
    const driveIds = drives.map(d => d._id);
    const applicationCounts = await Application.aggregate([
      { $match: { driveId: { $in: driveIds } } },
      { $group: { _id: '$driveId', count: { $sum: 1 } } }
    ]);

    // Create a map of driveId -> count
    const countMap = {};
    applicationCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    // Add applicationsCount to each drive
    const drivesWithCounts = drives.map(drive => ({
      ...drive,
      applicationsCount: countMap[drive._id.toString()] || 0,
    }));

    const count = await Drive.countDocuments(query);

    sendSuccessResponse(res, 'Drives fetched successfully', {
      drives: drivesWithCounts,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalDrives: count,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getDriveById = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await Drive.findById(id).populate('recruiterId', 'companyName');

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (drive.recruiterId._id.toString() !== recruiter._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    sendSuccessResponse(res, 'Drive details fetched successfully', { drive });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const updateDrive = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await Drive.findById(id);

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (drive.recruiterId.toString() !== recruiter._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    // If drive was approved, reset approval status and notify admins
    const wasApproved = drive.isApproved;

    // Update the drive
    const updateData = { ...req.body };

    // If it was approved, reset approval to require re-approval
    if (wasApproved) {
      updateData.isApproved = false;
      updateData.status = 'pending';
      updateData.approvedBy = null;
      updateData.approvedAt = null;
    }

    const updatedDrive = await Drive.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // If it was approved, notify admins about the edit requiring re-approval
    if (wasApproved) {
      const adminUsers = await User.find({ role: 'admin', isActive: true });
      for (const admin of adminUsers) {
        await createNotification({
          recipientId: admin._id,
          type: 'drive_approval_pending',
          title: 'Drive Updated - Re-approval Required',
          message: `${recruiter.companyName} has edited their drive "${updatedDrive.jobTitle}" and requires re-approval.`,
          relatedEntity: {
            entityType: 'drive',
            entityId: updatedDrive._id,
          },
          priority: 'high',
          actionUrl: '/admin/drives',
        });
      }
      sendSuccessResponse(res, 'Drive updated successfully. Re-approval required from admin.', { drive: updatedDrive });
    } else {
      sendSuccessResponse(res, 'Drive updated successfully', { drive: updatedDrive });
    }
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const closeDrive = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await Drive.findById(id);

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (drive.recruiterId.toString() !== recruiter._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    drive.status = 'closed';
    await drive.save();

    sendSuccessResponse(res, 'Drive closed successfully', { drive });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const drive = await Drive.findById(id);

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (drive.recruiterId.toString() !== recruiter._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    const query = { driveId: id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: 'studentId',
        select: 'firstName lastName studentId email phone branch batch cgpa skills',
        populate: {
          path: 'userId',
          select: 'email',
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    sendSuccessResponse(res, 'Applicants fetched successfully', {
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalApplicants: count,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const shortlistApplicants = async (req, res) => {
  try {
    const { applicationIds } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return sendErrorResponse(res, 'Please provide application IDs', 400);
    }

    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate('studentId driveId');

    for (const application of applications) {
      application.status = 'shortlisted';
      application.timeline.push({
        status: 'shortlisted',
        updatedBy: req.user._id,
        remarks: 'Shortlisted by recruiter',
      });

      await application.save();

      await createNotification({
        recipientId: application.studentId.userId,
        type: 'application_update',
        title: 'Application Shortlisted',
        message: `Congratulations! You have been shortlisted for ${application.driveId.jobTitle} at ${application.driveId.companyName}`,
        relatedEntity: {
          entityType: 'application',
          entityId: application._id,
        },
      });
    }

    sendSuccessResponse(res, `${applications.length} applicants shortlisted successfully`);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const rejectApplicants = async (req, res) => {
  try {
    const { applicationIds, reason } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return sendErrorResponse(res, 'Please provide application IDs', 400);
    }

    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate('studentId driveId');

    for (const application of applications) {
      // Store the current stage where rejection occurred
      const currentStage = application.status || 'applied';
      application.rejectedAtStage = currentStage;
      application.status = 'rejected';
      application.timeline.push({
        status: 'rejected',
        updatedBy: req.user._id,
        remarks: reason || `Rejected at ${currentStage} stage`,
      });

      await application.save();

      await createNotification({
        recipientId: application.studentId.userId,
        type: 'application_update',
        title: 'Application Update',
        message: `Your application for ${application.driveId.jobTitle} was not successful at the ${currentStage} stage.`,
        relatedEntity: {
          entityType: 'application',
          entityId: application._id,
        },
      });
    }

    sendSuccessResponse(res, `${applications.length} applicants rejected successfully`);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const application = await Application.findById(id)
      .populate('studentId driveId');

    if (!application) {
      return sendErrorResponse(res, 'Application not found', 404);
    }

    application.status = status;
    application.timeline.push({
      status,
      updatedBy: req.user._id,
      remarks: remarks || `Status updated to ${status}`,
    });

    await application.save();

    await createNotification({
      recipientId: application.studentId.userId,
      type: 'application_update',
      title: 'Application Status Updated',
      message: `Your application for ${application.driveId.jobTitle} status has been updated to ${status}`,
      relatedEntity: {
        entityType: 'application',
        entityId: application._id,
      },
    });

    sendSuccessResponse(res, 'Application status updated successfully', { application });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const addInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { round, scheduledDate, interviewerName, feedback, result } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return sendErrorResponse(res, 'Application not found', 404);
    }

    application.interviewDetails.push({
      round,
      scheduledDate,
      interviewerName,
      feedback,
      result,
    });

    await application.save();

    sendSuccessResponse(res, 'Interview feedback added successfully', { application });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const createOffer = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('studentId driveId');

    if (!application) {
      return sendErrorResponse(res, 'Application not found', 404);
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (application.driveId.recruiterId.toString() !== recruiter._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    const existingOffer = await Offer.findOne({ applicationId });
    if (existingOffer) {
      return sendErrorResponse(res, 'Offer already exists for this application', 400);
    }

    if (!req.file) {
      return sendErrorResponse(res, 'Please upload offer letter', 400);
    }

    // Upload offer letter to Firebase Storage
    const uploadResult = await uploadToFirebase(req.file.path, 'offer-letters');

    const { designation, ctc, joiningDate, location, bondDuration, benefits, validUntil } = req.body;

    const offer = await Offer.create({
      applicationId: application._id,
      studentId: application.studentId._id,
      driveId: application.driveId._id,
      recruiterId: recruiter._id,
      offerDetails: {
        designation,
        ctc,
        joiningDate,
        location,
        bondDuration,
        benefits: benefits ? JSON.parse(benefits) : [],
      },
      offerLetter: {
        url: uploadResult.url, // Public Firebase Storage URL
        fileName: uploadResult.fileName, // Firebase Storage path for deletion
      },
      validUntil,
    });

    application.status = 'offered';
    application.timeline.push({
      status: 'offered',
      updatedBy: req.user._id,
      remarks: 'Offer letter issued',
    });
    await application.save();

    await createNotification({
      recipientId: application.studentId.userId,
      type: 'offer_received',
      title: 'Offer Received!',
      message: `Congratulations! You have received an offer for ${designation} at ${application.driveId.companyName}`,
      relatedEntity: {
        entityType: 'offer',
        entityId: offer._id,
      },
      priority: 'high',
    });

    sendSuccessResponse(res, 'Offer created successfully', { offer }, 201);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getDashboard = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (!recruiter) {
      return sendErrorResponse(res, 'Recruiter profile not found', 404);
    }

    const totalDrives = await Drive.countDocuments({ recruiterId: recruiter._id });
    const activeDrives = await Drive.countDocuments({ recruiterId: recruiter._id, status: 'published' });
    const totalApplications = await Application.countDocuments({
      driveId: { $in: await Drive.find({ recruiterId: recruiter._id }).distinct('_id') },
    });
    const offersIssued = await Offer.countDocuments({ recruiterId: recruiter._id });

    const recentDrives = await Drive.find({ recruiterId: recruiter._id })
      .sort({ createdAt: -1 })
      .limit(5);

    sendSuccessResponse(res, 'Dashboard data fetched successfully', {
      stats: {
        totalDrives,
        activeDrives,
        totalApplications,
        offersIssued,
      },
      recentDrives,
      isApproved: recruiter.isApproved,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
