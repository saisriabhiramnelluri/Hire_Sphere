import Application from '../models/Application.js';
import Drive from '../models/Drive.js';
import Student from '../models/Student.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { checkEligibility } from '../services/eligibilityService.js';
import { createNotification } from '../services/notificationService.js';

export const createApplication = async (req, res) => {
  try {
    const { driveId, coverLetter, resumeId } = req.body;

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return sendErrorResponse(res, 'Student profile not found', 404);
    }

    const drive = await Drive.findById(driveId);

    if (!drive) {
      return sendErrorResponse(res, 'Drive not found', 404);
    }

    if (drive.status !== 'published') {
      return sendErrorResponse(res, 'Drive is not accepting applications', 400);
    }

    if (new Date() > new Date(drive.applicationDeadline)) {
      return sendErrorResponse(res, 'Application deadline has passed', 400);
    }

    const existingApplication = await Application.findOne({
      studentId: student._id,
      driveId,
    });

    if (existingApplication) {
      return sendErrorResponse(res, 'You have already applied to this drive', 400);
    }

    const eligibility = checkEligibility(student, drive);

    if (!eligibility.isEligible) {
      return sendErrorResponse(res, `You are not eligible: ${eligibility.reasons.join(', ')}`, 400);
    }

    let resumeUsed = null;
    if (resumeId) {
      const resume = student.resumes.id(resumeId);
      if (resume) {
        resumeUsed = {
          title: resume.title,
          url: resume.url,
        };
      }
    } else {
      const defaultResume = student.resumes.find((r) => r.isDefault);
      if (defaultResume) {
        resumeUsed = {
          title: defaultResume.title,
          url: defaultResume.url,
        };
      }
    }

    const application = await Application.create({
      studentId: student._id,
      driveId,
      coverLetter,
      resumeUsed,
      timeline: [
        {
          status: 'applied',
          remarks: 'Application submitted',
        },
      ],
    });

    drive.statistics.totalApplications += 1;
    await drive.save();

    sendSuccessResponse(res, 'Application submitted successfully', { application }, 201);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('studentId', 'firstName lastName studentId email phone branch batch cgpa')
      .populate('driveId', 'companyName jobTitle jobLocation ctc selectionProcess');

    if (!application) {
      return sendErrorResponse(res, 'Application not found', 404);
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (req.user.role === 'student' && application.studentId._id.toString() !== student._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    sendSuccessResponse(res, 'Application details fetched successfully', { application });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('driveId');

    if (!application) {
      return sendErrorResponse(res, 'Application not found', 404);
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (application.studentId.toString() !== student._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    if (['offered', 'rejected', 'withdrawn'].includes(application.status)) {
      return sendErrorResponse(res, 'Cannot withdraw this application', 400);
    }

    application.status = 'withdrawn';
    application.timeline.push({
      status: 'withdrawn',
      remarks: 'Application withdrawn by student',
    });

    await application.save();

    application.driveId.statistics.totalApplications -= 1;
    await application.driveId.save();

    sendSuccessResponse(res, 'Application withdrawn successfully', { application });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
