import Offer from '../models/Offer.js';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { createNotification } from '../services/notificationService.js';

export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id)
      .populate('studentId', 'firstName lastName studentId email')
      .populate('driveId', 'companyName jobTitle')
      .populate('recruiterId', 'companyName');

    if (!offer) {
      return sendErrorResponse(res, 'Offer not found', 404);
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (req.user.role === 'student' && offer.studentId._id.toString() !== student._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    sendSuccessResponse(res, 'Offer details fetched successfully', { offer });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const respondToOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, remarks } = req.body;

    const offer = await Offer.findById(id).populate('driveId studentId');

    if (!offer) {
      return sendErrorResponse(res, 'Offer not found', 404);
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (offer.studentId._id.toString() !== student._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    if (offer.status !== 'pending') {
      return sendErrorResponse(res, 'Offer has already been responded to', 400);
    }

    if (new Date() > new Date(offer.validUntil)) {
      return sendErrorResponse(res, 'Offer has expired', 400);
    }

    offer.status = decision;
    offer.studentResponse = {
      decision,
      respondedAt: new Date(),
      remarks,
    };

    await offer.save();

    // Update application status as well
    await Application.findByIdAndUpdate(offer.applicationId, {
      status: decision === 'accepted' ? 'accepted' : 'offer_rejected',
    });

    if (decision === 'accepted') {
      student.placementStatus.isPlaced = true;
      student.placementStatus.placedCompany = offer.driveId.companyName;
      student.placementStatus.placedCTC = offer.offerDetails.ctc;
      student.placementStatus.placedJobType = offer.driveId.jobType === 'both' ? 'full_time' : offer.driveId.jobType;
      student.placementStatus.placedDate = new Date();
      student.placementStatus.offerLetterUrl = offer.offerLetter.url;
      await student.save();
    }

    // Notify recruiter
    await createNotification({
      recipientId: offer.recruiterId,
      type: 'offer_response',
      title: `Offer ${decision === 'accepted' ? 'Accepted' : 'Rejected'}`,
      message: `${student.firstName} ${student.lastName} has ${decision} the offer for ${offer.offerDetails.designation}`,
      relatedId: offer._id,
      relatedModel: 'Offer',
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id,
        type: 'offer_response',
        title: `Offer ${decision === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message: `${student.firstName} ${student.lastName} has ${decision} the offer from ${offer.driveId.companyName} for ${offer.offerDetails.designation} (${offer.offerDetails.ctc} LPA)`,
        relatedId: offer._id,
        relatedModel: 'Offer',
      });
    }

    sendSuccessResponse(res, `Offer ${decision} successfully`, { offer });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const uploadJoiningConfirmation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return sendErrorResponse(res, 'Please upload joining confirmation document', 400);
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return sendErrorResponse(res, 'Offer not found', 404);
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (offer.studentId.toString() !== student._id.toString()) {
      return sendErrorResponse(res, 'Unauthorized access', 403);
    }

    if (offer.status !== 'accepted') {
      return sendErrorResponse(res, 'Offer must be accepted first', 400);
    }

    const uploadResult = await uploadToCloudinary(req.file.path, 'joining-confirmations');

    offer.joiningConfirmation = {
      isConfirmed: true,
      documentUrl: uploadResult.url,
      publicId: uploadResult.public_id,
      confirmedAt: new Date(),
    };

    await offer.save();

    sendSuccessResponse(res, 'Joining confirmation uploaded successfully', { offer });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
