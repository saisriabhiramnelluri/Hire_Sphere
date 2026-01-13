import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendErrorResponse } from '../utils/responseHandler.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return sendErrorResponse(res, 'User not found', 401);
      }

      if (!req.user.isActive) {
        return sendErrorResponse(res, 'Account is deactivated', 403);
      }

      next();
    } catch (error) {
      return sendErrorResponse(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return sendErrorResponse(res, 'Not authorized, no token', 401);
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  }

  next();
};
