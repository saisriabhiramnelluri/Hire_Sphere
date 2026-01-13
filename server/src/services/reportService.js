import Student from '../models/Student.js';
import Drive from '../models/Drive.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';

export const generatePlacementReport = async (filters = {}) => {
  try {
    const { batch, branch, startDate, endDate } = filters;

    const query = {};
    if (batch) query.batch = parseInt(batch);
    if (branch) query.branch = branch;

    const students = await Student.find(query);
    const totalStudents = students.length;
    const placedStudents = students.filter((s) => s.placementStatus.isPlaced).length;

    const placementData = students
      .filter((s) => s.placementStatus.isPlaced)
      .map((s) => ({
        studentId: s.studentId,
        name: `${s.firstName} ${s.lastName}`,
        branch: s.branch,
        cgpa: s.cgpa,
        company: s.placementStatus.placedCompany,
        ctc: s.placementStatus.placedCTC,
        placedDate: s.placementStatus.placedDate,
      }));

    const ctcData = placementData.map((p) => p.ctc).filter((ctc) => ctc);
    const avgCTC = ctcData.length > 0 ? ctcData.reduce((a, b) => a + b, 0) / ctcData.length : 0;
    const maxCTC = ctcData.length > 0 ? Math.max(...ctcData) : 0;
    const minCTC = ctcData.length > 0 ? Math.min(...ctcData) : 0;

    return {
      summary: {
        totalStudents,
        placedStudents,
        unplacedStudents: totalStudents - placedStudents,
        placementPercentage: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
        avgCTC: avgCTC.toFixed(2),
        maxCTC,
        minCTC,
      },
      placements: placementData,
    };
  } catch (error) {
    throw new Error(`Failed to generate placement report: ${error.message}`);
  }
};

export const generateDriveReport = async (driveId) => {
  try {
    const drive = await Drive.findById(driveId).populate('recruiterId', 'companyName');

    if (!drive) {
      throw new Error('Drive not found');
    }

    const applications = await Application.find({ driveId }).populate('studentId', 'firstName lastName branch cgpa');

    const statusCount = {};
    applications.forEach((app) => {
      statusCount[app.status] = (statusCount[app.status] || 0) + 1;
    });

    const branchWise = {};
    applications.forEach((app) => {
      const branch = app.studentId.branch;
      if (!branchWise[branch]) {
        branchWise[branch] = { total: 0, shortlisted: 0, offered: 0 };
      }
      branchWise[branch].total += 1;
      if (app.status === 'shortlisted') branchWise[branch].shortlisted += 1;
      if (app.status === 'offered') branchWise[branch].offered += 1;
    });

    const offers = await Offer.find({ driveId });

    return {
      drive: {
        company: drive.companyName,
        jobTitle: drive.jobTitle,
        ctc: drive.ctc,
        positions: drive.positions,
      },
      statistics: {
        totalApplications: applications.length,
        statusBreakdown: statusCount,
        branchWise,
        offersIssued: offers.length,
        offersAccepted: offers.filter((o) => o.status === 'accepted').length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to generate drive report: ${error.message}`);
  }
};

export const generateStudentReport = async (studentId) => {
  try {
    const student = await Student.findById(studentId).populate('userId', 'email');

    if (!student) {
      throw new Error('Student not found');
    }

    const applications = await Application.find({ studentId }).populate('driveId', 'companyName jobTitle ctc');
    const offers = await Offer.find({ studentId }).populate('driveId', 'companyName');

    return {
      student: {
        name: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        email: student.userId.email,
        branch: student.branch,
        batch: student.batch,
        cgpa: student.cgpa,
      },
      applications: applications.map((app) => ({
        company: app.driveId.companyName,
        position: app.driveId.jobTitle,
        status: app.status,
        appliedDate: app.createdAt,
      })),
      offers: offers.map((offer) => ({
        company: offer.driveId.companyName,
        designation: offer.offerDetails.designation,
        ctc: offer.offerDetails.ctc,
        status: offer.status,
      })),
      placementStatus: student.placementStatus,
    };
  } catch (error) {
    throw new Error(`Failed to generate student report: ${error.message}`);
  }
};
