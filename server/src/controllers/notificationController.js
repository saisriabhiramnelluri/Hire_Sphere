import Notification from '../models/Notification.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

export const getMyNotifications = async (req, res) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;

    const query = { recipientId: req.user._id };
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });

    sendSuccessResponse(res, 'Notifications fetched successfully', {
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalNotifications: count,
      unreadCount,
    });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return sendErrorResponse(res, 'Notification not found', 404);
    }

    sendSuccessResponse(res, 'Notification marked as read', { notification });
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    sendSuccessResponse(res, 'All notifications marked as read');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return sendErrorResponse(res, 'Notification not found', 404);
    }

    sendSuccessResponse(res, 'Notification deleted successfully');
  } catch (error) {
    sendErrorResponse(res, error.message, 500);
  }
};
