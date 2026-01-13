import Notification from '../models/Notification.js';
import { sendEmail } from '../config/email.js';
import User from '../models/User.js';

export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

export const createBulkNotifications = async (notifications) => {
  try {
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    throw new Error(`Failed to create bulk notifications: ${error.message}`);
  }
};

export const sendNotificationWithEmail = async (userId, notificationData, emailData) => {
  try {
    await createNotification({
      recipientId: userId,
      ...notificationData,
    });

    const user = await User.findById(userId);
    if (user && emailData) {
      await sendEmail({
        email: user.email,
        ...emailData,
      });
    }
  } catch (error) {
    throw new Error(`Failed to send notification with email: ${error.message}`);
  }
};

export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
};

export const deleteOldNotifications = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });

    return result.deletedCount;
  } catch (error) {
    throw new Error(`Failed to delete old notifications: ${error.message}`);
  }
};
