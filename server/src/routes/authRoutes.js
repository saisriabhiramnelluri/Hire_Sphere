import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, sanitizeInput } from '../middleware/validationMiddleware.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from '../validators/authValidator.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, sanitizeInput, registerValidator, validate, register);
router.post('/login', authLimiter, sanitizeInput, loginValidator, validate, login);
router.get('/me', protect, getCurrentUser);
router.post('/forgot-password', authLimiter, sanitizeInput, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', authLimiter, sanitizeInput, resetPasswordValidator, validate, resetPassword);
router.post('/change-password', protect, sanitizeInput, changePasswordValidator, validate, changePassword);
router.post('/logout', protect, logout);

export default router;
