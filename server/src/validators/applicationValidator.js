import { body, param } from 'express-validator';

export const createApplicationValidator = [
  body('driveId')
    .isMongoId()
    .withMessage('Invalid drive ID'),
  body('coverLetter')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Cover letter must not exceed 2000 characters'),
];

export const updateApplicationStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required'),
  // Status is now dynamic based on drive's hiring pipeline
  // No longer restricted to a fixed enum
  body('remarks')
    .optional()
    .trim(),
];

export const addInterviewFeedbackValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID'),
  body('round')
    .trim()
    .notEmpty()
    .withMessage('Interview round is required'),
  body('feedback')
    .optional()
    .trim(),
  body('result')
    .isIn(['pending', 'cleared', 'rejected'])
    .withMessage('Invalid result'),
];

export const applicationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID'),
];
