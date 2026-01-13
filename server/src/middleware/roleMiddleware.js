import { sendErrorResponse } from '../utils/responseHandler.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        `Role ${req.user.role} is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};

export const checkStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Student profile not found', 404);
    }

    req.student = student;
    next();
  } catch (error) {
    return sendErrorResponse(res, 'Error fetching student profile', 500);
  }
};

export const checkRecruiterProfile = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (!recruiter) {
      return sendErrorResponse(res, 'Recruiter profile not found', 404);
    }

    req.recruiter = recruiter;
    next();
  } catch (error) {
    return sendErrorResponse(res, 'Error fetching recruiter profile', 500);
  }
};

export const checkRecruiterApproval = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });

    if (!recruiter) {
      return sendErrorResponse(res, 'Recruiter profile not found', 404);
    }

    if (!recruiter.isApproved) {
      return sendErrorResponse(
        res,
        'Your recruiter account is pending approval',
        403
      );
    }

    req.recruiter = recruiter;
    next();
  } catch (error) {
    return sendErrorResponse(res, 'Error checking recruiter approval', 500);
  }
};
