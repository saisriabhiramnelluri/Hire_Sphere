import Student from '../models/Student.js';
import Drive from '../models/Drive.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

export const getOverallAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ 'placementStatus.isPlaced': true });
    const totalDrives = await Drive.countDocuments({ isApproved: true, ...dateFilter });
    const totalApplications = await Application.countDocuments(dateFilter);
    const totalOffers = await Offer.countDocuments(dateFilter);

    const avgCTC = await Student.aggregate([
      { $match: { 'placementStatus.isPlaced': true } },
      { $group: { _id: null, avg: { $avg: '$placementStatus.placedCTC' } } },
    ]);

    const maxCTC = await Student.aggregate([
      { $match: { 'placementStatus.isPlaced': true } },
      { $group: { _id: null, max: { $max: '$placementStatus.placedCTC' } } },
    ]);

    sendSuccessResponse(res, 'Overall analytics fetched successfully', {
      totalStudents,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      placementPercentage: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
      totalDrives,
      totalApplications,
      totalOffers,
      avgCTC: avgCTC[0]?.avg || 0,
      maxCTC: maxCTC[0]?.max || 0,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getBranchWiseAnalytics = async (req, res) => {
  try {
    const branchStats = await Student.aggregate([
      {
        $group: {
          _id: '$branch',
          total: { $sum: 1 },
          placed: { $sum: { $cond: ['$placementStatus.isPlaced', 1, 0] } },
          avgCGPA: { $avg: '$cgpa' },
        },
      },
      {
        $project: {
          branch: '$_id',
          total: 1,
          placed: 1,
          unplaced: { $subtract: ['$total', '$placed'] },
          placementPercentage: {
            $multiply: [{ $divide: ['$placed', '$total'] }, 100],
          },
          avgCGPA: { $round: ['$avgCGPA', 2] },
        },
      },
      { $sort: { placementPercentage: -1 } },
    ]);

    sendSuccessResponse(res, 'Branch-wise analytics fetched successfully', { branchStats });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getCompanyWiseAnalytics = async (req, res) => {
  try {
    const companyStats = await Student.aggregate([
      { $match: { 'placementStatus.isPlaced': true } },
      {
        $group: {
          _id: '$placementStatus.placedCompany',
          studentsHired: { $sum: 1 },
          avgCTC: { $avg: '$placementStatus.placedCTC' },
          maxCTC: { $max: '$placementStatus.placedCTC' },
        },
      },
      { $sort: { studentsHired: -1 } },
      { $limit: 20 },
    ]);

    sendSuccessResponse(res, 'Company-wise analytics fetched successfully', { companyStats });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
