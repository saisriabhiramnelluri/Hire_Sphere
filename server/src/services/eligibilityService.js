export const checkEligibility = (student, drive) => {
  const reasons = [];
  let isEligible = true;

  if (!drive.eligibilityCriteria.branches.includes(student.branch)) {
    isEligible = false;
    reasons.push('Branch not eligible');
  }

  if (!drive.eligibilityCriteria.allowedBatches.includes(student.batch)) {
    isEligible = false;
    reasons.push('Batch not eligible');
  }

  if (student.cgpa < drive.eligibilityCriteria.minCGPA) {
    isEligible = false;
    reasons.push(`CGPA below minimum requirement (${drive.eligibilityCriteria.minCGPA})`);
  }

  if (student.activeBacklogs > drive.eligibilityCriteria.maxBacklogs) {
    isEligible = false;
    reasons.push(`Active backlogs exceed limit (${drive.eligibilityCriteria.maxBacklogs})`);
  }

  if (drive.eligibilityCriteria.minTenthMarks && student.tenthMarks < drive.eligibilityCriteria.minTenthMarks) {
    isEligible = false;
    reasons.push(`10th marks below minimum requirement (${drive.eligibilityCriteria.minTenthMarks})`);
  }

  if (drive.eligibilityCriteria.minTwelfthMarks && student.twelfthMarks < drive.eligibilityCriteria.minTwelfthMarks) {
    isEligible = false;
    reasons.push(`12th marks below minimum requirement (${drive.eligibilityCriteria.minTwelfthMarks})`);
  }

  // CTC-based eligibility for placed students
  if (student.placementStatus?.isPlaced) {
    const studentPlacedCTC = student.placementStatus.placedCTC || 0;
    const studentPlacedJobType = student.placementStatus.placedJobType || 'full_time';
    const driveMinCTC = drive.ctc?.min || 0;
    const driveJobType = drive.jobType || 'full_time';

    // Compare same job types: intern with intern, full_time with full_time
    // If drive is 'both', compare based on the student's placed job type
    let shouldCompare = false;

    if (driveJobType === 'both') {
      shouldCompare = true; // Compare with student's current CTC regardless of type
    } else if (driveJobType === studentPlacedJobType) {
      shouldCompare = true; // Same type, compare CTCs
    } else if (driveJobType === 'full_time' && studentPlacedJobType === 'internship') {
      // Student has internship, applying for full-time - allow (career progression)
      shouldCompare = false;
    } else if (driveJobType === 'internship' && studentPlacedJobType === 'full_time') {
      // Student has full-time, applying for internship - block
      isEligible = false;
      reasons.push('Already placed in full-time role, cannot apply for internship');
    }

    if (shouldCompare && driveMinCTC <= studentPlacedCTC) {
      isEligible = false;
      reasons.push(`Already placed at ${studentPlacedCTC} LPA. Can only apply for packages above this CTC.`);
    }
  }

  return {
    isEligible,
    reasons,
  };
};

export const getEligibleStudents = async (drive, Student) => {
  // Base query for basic eligibility
  const query = {
    branch: { $in: drive.eligibilityCriteria.branches },
    batch: { $in: drive.eligibilityCriteria.allowedBatches },
    cgpa: { $gte: drive.eligibilityCriteria.minCGPA },
    activeBacklogs: { $lte: drive.eligibilityCriteria.maxBacklogs },
    // Either not placed OR placed with lower CTC (for higher package opportunities)
    $or: [
      { 'placementStatus.isPlaced': false },
      { 'placementStatus.isPlaced': { $exists: false } },
      { 'placementStatus.placedCTC': { $lt: drive.ctc?.min || 0 } },
    ],
  };

  if (drive.eligibilityCriteria.minTenthMarks) {
    query.tenthMarks = { $gte: drive.eligibilityCriteria.minTenthMarks };
  }

  if (drive.eligibilityCriteria.minTwelfthMarks) {
    query.twelfthMarks = { $gte: drive.eligibilityCriteria.minTwelfthMarks };
  }

  return await Student.find(query).populate('userId', 'email');
};

