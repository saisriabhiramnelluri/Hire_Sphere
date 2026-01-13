import { body, param } from 'express-validator';

export const createDriveValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('jobTitle')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),
  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ max: 5000 })
    .withMessage('Job description must not exceed 5000 characters'),
  body('jobType')
    .isIn(['full_time', 'internship', 'both'])
    .withMessage('Invalid job type'),
  body('jobLocation')
    .trim()
    .notEmpty()
    .withMessage('Job location is required'),
  body('ctc.min')
    .isNumeric()
    .withMessage('Minimum CTC must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum CTC must be positive'),
  body('eligibilityCriteria.branches')
    .isArray({ min: 1 })
    .withMessage('At least one branch must be selected'),
  body('eligibilityCriteria.minCGPA')
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
  body('eligibilityCriteria.allowedBatches')
    .isArray({ min: 1 })
    .withMessage('At least one batch must be selected'),
  body('positions')
    .isInt({ min: 1 })
    .withMessage('Number of positions must be at least 1'),
  body('applicationDeadline')
    .notEmpty()
    .withMessage('Application deadline is required')
    .custom((value) => {
      const deadline = new Date(value);
      if (isNaN(deadline.getTime())) {
        throw new Error('Invalid application deadline format');
      }
      // Compare dates only (ignore time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      if (deadline < today) {
        throw new Error('Application deadline must be today or in the future');
      }
      return true;
    }),
];

export const updateDriveValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid drive ID'),
  body('companyName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty'),
  body('jobTitle')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Job title cannot be empty'),
  body('jobType')
    .optional()
    .isIn(['full_time', 'internship', 'both'])
    .withMessage('Invalid job type'),
  body('eligibilityCriteria.minCGPA')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
];

export const driveIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid drive ID'),
];
