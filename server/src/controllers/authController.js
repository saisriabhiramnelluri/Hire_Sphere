import User from '../models/User.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { sendEmail } from '../config/email.js';
import crypto from 'crypto';

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, 'Email already registered', 400);
    }

    const user = await User.create({
      email,
      password,
      role,
    });

    const token = user.generateAuthToken();

    await sendEmail({
      email: user.email,
      subject: 'Welcome to HireSphere',
      html: `
        <h2>Welcome to HireSphere!</h2>
        <p>Your account has been created successfully.</p>
        <p>Please complete your profile to get started.</p>
      `,
    });

    sendSuccessResponse(res, 'Registration successful', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
    }, 201);
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendErrorResponse(res, 'Invalid email or password', 401);
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return sendErrorResponse(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendErrorResponse(res, 'Your account has been deactivated', 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = user.generateAuthToken();

    let profileData = null;
    if (user.role === 'student') {
      profileData = await Student.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profileData = await Recruiter.findOne({ userId: user._id });
    }

    sendSuccessResponse(res, 'Login successful', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile: profileData,
      token,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let profileData = null;
    if (user.role === 'student') {
      profileData = await Student.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profileData = await Recruiter.findOne({ userId: user._id });
    }

    sendSuccessResponse(res, 'User data fetched successfully', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
      },
      profile: profileData,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return sendErrorResponse(res, 'No user found with this email', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    sendSuccessResponse(res, 'Password reset email sent successfully');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendErrorResponse(res, 'Invalid or expired reset token', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Successful',
      html: `
        <h2>Password Reset Successful</h2>
        <p>Your password has been reset successfully.</p>
        <p>You can now login with your new password.</p>
      `,
    });

    sendSuccessResponse(res, 'Password reset successful');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isPasswordMatch = await user.matchPassword(currentPassword);

    if (!isPasswordMatch) {
      return sendErrorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    sendSuccessResponse(res, 'Password changed successfully');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const logout = async (req, res) => {
  try {
    sendSuccessResponse(res, 'Logout successful');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
