import Drive from '../models/Drive.js';
import Application from '../models/Application.js';
import Student from '../models/Student.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

export const getAllDrives = async (req, res) => {
  try {
    const { status, jobType, page = 1, limit = 10, search } = req.query;

    const query = { isApproved: true };
    
    if (status) query.status = status;
    if (jobType) query.jobType = jobType;
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const drives = await Drive.find(query)
      .populate('recruiterId', 'companyName companyLogo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Drive.countDocuments(query);

    sendSuccessResponse(res, 'Drives fetched successfully', {
      drives,
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

    const drive = await Drive.findById(id).populate('recruiterId', 'companyName companyWebsite companyLogo industry');

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    sendSuccessResponse(res, 'Drive details fetched successfully', { drive });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getDriveStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await Drive.findById(id);

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    const totalApplications = await Application.countDocuments({ driveId: id });
    const shortlisted = await Application.countDocuments({ driveId: id, status: 'shortlisted' });
    const testCleared = await Application.countDocuments({ driveId: id, status: 'test_cleared' });
    const interviewScheduled = await Application.countDocuments({ driveId: id, status: 'interview_scheduled' });
    const offered = await Application.countDocuments({ driveId: id, status: 'offered' });
    const rejected = await Application.countDocuments({ driveId: id, status: 'rejected' });

    const branchWiseApplications = await Application.aggregate([
      { $match: { driveId: drive._id } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.branch',
          count: { $sum: 1 },
        },
      },
    ]);

    sendSuccessResponse(res, 'Drive statistics fetched successfully', {
      statistics: {
        totalApplications,
        shortlisted,
        testCleared,
        interviewScheduled,
        offered,
        rejected,
        conversionRate: totalApplications > 0 ? ((offered / totalApplications) * 100).toFixed(2) : 0,
      },
      branchWise: branchWiseApplications,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
