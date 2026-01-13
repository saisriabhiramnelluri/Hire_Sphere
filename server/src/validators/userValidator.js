import { body, param } from 'express-validator';

export const createStudentValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date of birth'),
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),
  body('batch')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Invalid batch year'),
  body('cgpa')
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
  body('tenthMarks')
    .isFloat({ min: 0, max: 100 })
    .withMessage('10th marks must be between 0 and 100'),
  body('twelfthMarks')
    .isFloat({ min: 0, max: 100 })
    .withMessage('12th marks must be between 0 and 100'),
];

export const updateStudentValidator = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
];

export const createRecruiterValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
  body('contactPerson.firstName')
    .trim()
    .notEmpty()
    .withMessage('Contact person first name is required'),
  body('contactPerson.lastName')
    .trim()
    .notEmpty()
    .withMessage('Contact person last name is required'),
  body('contactPerson.designation')
    .trim()
    .notEmpty()
    .withMessage('Contact person designation is required'),
  body('contactPerson.phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact phone must be a valid 10-digit number'),
];

export const userIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
];
