import User from '../models/User.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import Drive from '../models/Drive.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import AuditLog from '../models/AuditLog.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { sendEmail } from '../config/email.js';
import { createNotification } from '../services/notificationService.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalRecruiters = await Recruiter.countDocuments({ isApproved: true });
    const totalDrives = await Drive.countDocuments({ isApproved: true });
    const activeDrives = await Drive.countDocuments({ status: 'published' });
    const totalApplications = await Application.countDocuments();
    const placedStudents = await Student.countDocuments({ 'placementStatus.isPlaced': true });

    const recentApplications = await Application.find()
      .populate('studentId', 'firstName lastName studentId')
      .populate('driveId', 'companyName jobTitle')
      .sort({ createdAt: -1 })
      .limit(10);

    const pendingRecruiterApprovals = await Recruiter.countDocuments({ isApproved: false });
    const pendingDriveApprovals = await Drive.countDocuments({ isApproved: false });

    sendSuccessResponse(res, 'Dashboard stats fetched successfully', {
      stats: {
        totalStudents,
        totalRecruiters,
        totalDrives,
        activeDrives,
        totalApplications,
        placedStudents,
        placementPercentage: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
      },
      pending: {
        recruiterApprovals: pendingRecruiterApprovals,
        driveApprovals: pendingDriveApprovals,
      },
      recentApplications,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    sendSuccessResponse(res, 'Users fetched successfully', {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, 'Email already registered', 400);
    }

    const user = await User.create({
      email,
      password,
      role,
      isVerified: true,
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: user._id,
      metadata: { createdRole: role },
    });

    await sendEmail({
      email: user.email,
      subject: 'Account Created - HireSphere',
      html: `
        <h2>Your HireSphere Account</h2>
        <p>An account has been created for you by the admin.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
        <p>Please login and change your password immediately.</p>
      `,
    });

    sendSuccessResponse(res, 'User created successfully', { user }, 201);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    await AuditLog.create({
      userId: req.user._id,
      action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entityType: 'user',
      entityId: user._id,
    });

    sendSuccessResponse(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, { user });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    if (user.role === 'student') {
      await Student.deleteOne({ userId: id });
    } else if (user.role === 'recruiter') {
      await Recruiter.deleteOne({ userId: id });
    }

    await User.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user._id,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: id,
      severity: 'critical',
    });

    sendSuccessResponse(res, 'User deleted successfully');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getPendingRecruiterApprovals = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({ isApproved: false })
      .populate('userId', 'email createdAt')
      .sort({ createdAt: -1 });

    sendSuccessResponse(res, 'Pending recruiter approvals fetched successfully', { recruiters });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const approveRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    const recruiter = await Recruiter.findById(id).populate('userId', 'email');

    if (!recruiter) {
      return sendErrorResponse(res, 'Recruiter not found', 404);
    }

    recruiter.isApproved = true;
    recruiter.approvedBy = req.user._id;
    recruiter.approvedAt = new Date();
    await recruiter.save();

    await createNotification({
      recipientId: recruiter.userId._id,
      type: 'general',
      title: 'Recruiter Account Approved',
      message: 'Your recruiter account has been approved. You can now create placement drives.',
    });

    await sendEmail({
      email: recruiter.userId.email,
      subject: 'Recruiter Account Approved',
      html: `
        <h2>Account Approved</h2>
        <p>Congratulations! Your recruiter account has been approved.</p>
        <p>You can now create and manage placement drives.</p>
      `,
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'APPROVE_RECRUITER',
      entityType: 'recruiter',
      entityId: recruiter._id,
    });

    sendSuccessResponse(res, 'Recruiter approved successfully', { recruiter });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const rejectRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const recruiter = await Recruiter.findById(id).populate('userId', 'email');

    if (!recruiter) {
      return sendErrorResponse(res, 'Recruiter not found', 404);
    }

    recruiter.rejectionReason = reason;
    await recruiter.save();

    await createNotification({
      recipientId: recruiter.userId._id,
      type: 'general',
      title: 'Recruiter Account Rejected',
      message: `Your recruiter account application has been rejected. Reason: ${reason}`,
    });

    await sendEmail({
      email: recruiter.userId.email,
      subject: 'Recruiter Account Rejected',
      html: `
        <h2>Account Application Rejected</h2>
        <p>We regret to inform you that your recruiter account application has been rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you have any questions, please contact the placement cell.</p>
      `,
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'REJECT_RECRUITER',
      entityType: 'recruiter',
      entityId: recruiter._id,
      changes: { reason },
    });

    sendSuccessResponse(res, 'Recruiter rejected successfully');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getPendingDriveApprovals = async (req, res) => {
  try {
    const drives = await Drive.find({ isApproved: false })
      .populate('recruiterId', 'companyName')
      .sort({ createdAt: -1 });

    sendSuccessResponse(res, 'Pending drive approvals fetched successfully', { drives });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const approveDrive = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await Drive.findById(id).populate('recruiterId');

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    drive.isApproved = true;
    drive.approvedBy = req.user._id;
    drive.approvedAt = new Date();
    drive.status = 'published';
    await drive.save();

    const eligibleStudents = await Student.find({
      branch: { $in: drive.eligibilityCriteria.branches },
      batch: { $in: drive.eligibilityCriteria.allowedBatches },
      cgpa: { $gte: drive.eligibilityCriteria.minCGPA },
      activeBacklogs: { $lte: drive.eligibilityCriteria.maxBacklogs },
    }).populate('userId');

    for (const student of eligibleStudents) {
      await createNotification({
        recipientId: student.userId._id,
        type: 'drive_announcement',
        title: `New Drive: ${drive.companyName}`,
        message: `A new placement drive for ${drive.jobTitle} has been published.`,
        relatedEntity: {
          entityType: 'drive',
          entityId: drive._id,
        },
        actionUrl: `/student/drives/${drive._id}`,
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'APPROVE_DRIVE',
      entityType: 'drive',
      entityId: drive._id,
    });

    sendSuccessResponse(res, 'Drive approved and published successfully', { drive });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const rejectDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const drive = await Drive.findById(id).populate('recruiterId');

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    drive.rejectionReason = reason;
    await drive.save();

    await createNotification({
      recipientId: drive.recruiterId.userId,
      type: 'general',
      title: 'Drive Rejected',
      message: `Your drive for ${drive.jobTitle} has been rejected. Reason: ${reason}`,
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'REJECT_DRIVE',
      entityType: 'drive',
      entityId: drive._id,
      changes: { reason },
    });

    sendSuccessResponse(res, 'Drive rejected successfully');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getPlacementAnalytics = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ 'placementStatus.isPlaced': true });
    
    const branchWiseStats = await Student.aggregate([
      {
        $group: {
          _id: '$branch',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: ['$placementStatus.isPlaced', 1, 0] },
          },
        },
      },
      {
        $project: {
          branch: '$_id',
          total: 1,
          placed: 1,
          percentage: {
            $multiply: [{ $divide: ['$placed', '$total'] }, 100],
          },
        },
      },
    ]);

    const ctcStats = await Student.aggregate([
      {
        $match: { 'placementStatus.isPlaced': true },
      },
      {
        $group: {
          _id: null,
          avgCTC: { $avg: '$placementStatus.placedCTC' },
          maxCTC: { $max: '$placementStatus.placedCTC' },
          minCTC: { $min: '$placementStatus.placedCTC' },
        },
      },
    ]);

    const topCompanies = await Student.aggregate([
      {
        $match: { 'placementStatus.isPlaced': true },
      },
      {
        $group: {
          _id: '$placementStatus.placedCompany',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    sendSuccessResponse(res, 'Analytics fetched successfully', {
      overall: {
        totalStudents,
        placedStudents,
        placementPercentage: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
      },
      branchWise: branchWiseStats,
      ctc: ctcStats[0] || { avgCTC: 0, maxCTC: 0, minCTC: 0 },
      topCompanies,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
