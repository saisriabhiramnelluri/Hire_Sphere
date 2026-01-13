import cron from 'node-cron';
import Student from '../models/Student.js';
import { createNotification } from '../services/notificationService.js';

export const sendProfileCompletionReminders = () => {
  cron.schedule('0 12 * * 1', async () => {
    try {
      const incompleteProfiles = await Student.find({
        $or: [
          { resumes: { $size: 0 } },
          { skills: { $size: 0 } },
          { linkedIn: { $exists: false } },
        ],
      }).populate('userId', '_id email');

      for (const student of incompleteProfiles) {
        const missingItems = [];
        if (student.resumes.length === 0) missingItems.push('Resume');
        if (student.skills.length === 0) missingItems.push('Skills');
        if (!student.linkedIn) missingItems.push('LinkedIn profile');

        await createNotification({
          recipientId: student.userId._id,
          type: 'general',
          title: 'Complete Your Profile',
          message: `Please complete your profile by adding: ${missingItems.join(', ')}. A complete profile increases your chances of getting shortlisted.`,
          priority: 'medium',
        });
      }

      if (incompleteProfiles.length > 0) {
        console.log(`Sent profile completion reminders to ${incompleteProfiles.length} students`);
      }
    } catch (error) {
      console.error('Error sending profile completion reminders:', error.message);
    }
  });
};

export const sendUnplacedStudentReminders = () => {
  cron.schedule('0 15 * * 5', async () => {
    try {
      const unplacedStudents = await Student.find({
        'placementStatus.isPlaced': false,
      }).populate('userId', '_id');

      for (const student of unplacedStudents) {
        await createNotification({
          recipientId: student.userId._id,
          type: 'general',
          title: 'Keep Applying!',
          message: 'Check out the latest placement drives and keep applying. Your opportunity is waiting!',
          priority: 'low',
        });
      }

      if (unplacedStudents.length > 0) {
        console.log(`Sent motivation reminders to ${unplacedStudents.length} unplaced students`);
      }
    } catch (error) {
      console.error('Error sending unplaced student reminders:', error.message);
    }
  });
};
