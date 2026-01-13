import cron from 'node-cron';
import Drive from '../models/Drive.js';

export const updateDriveStatuses = () => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      const now = new Date();

      const drivesToClose = await Drive.updateMany(
        {
          status: { $in: ['published', 'ongoing'] },
          applicationDeadline: { $lt: now },
        },
        {
          $set: { status: 'closed' },
        }
      );

      const drivesToActivate = await Drive.updateMany(
        {
          status: 'published',
          driveDate: { $lte: now },
        },
        {
          $set: { status: 'ongoing' },
        }
      );

      if (drivesToClose.modifiedCount > 0 || drivesToActivate.modifiedCount > 0) {
        console.log(`Drive status update: ${drivesToClose.modifiedCount} closed, ${drivesToActivate.modifiedCount} activated`);
      }
    } catch (error) {
      console.error('Error updating drive statuses:', error.message);
    }
  });
};
