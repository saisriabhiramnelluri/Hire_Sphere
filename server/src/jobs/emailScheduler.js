import cron from 'node-cron';
import Drive from '../models/Drive.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import Student from '../models/Student.js';
import { sendEmail } from '../config/email.js';
import { createNotification } from '../services/notificationService.js';

export const startCronJobs = () => {
  cron.schedule('0 9 * * *', async () => {
    await sendDeadlineReminders();
  });

  cron.schedule('0 10 * * *', async () => {
    await sendInterviewReminders();
  });

  cron.schedule('0 0 * * *', async () => {
    await closeExpiredDrives();
  });

  cron.schedule('0 8 * * *', async () => {
    await sendOfferExpiryReminders();
  });

  console.log('Cron jobs initialized successfully');
};

const sendDeadlineReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const drives = await Drive.find({
      status: 'published',
      applicationDeadline: {
        $gte: tomorrow,
        $lte: endOfTomorrow,
      },
    });

    for (const drive of drives) {
      const eligibleStudents = await Student.find({
        branch: { $in: drive.eligibilityCriteria.branches },
        batch: { $in: drive.eligibilityCriteria.allowedBatches },
        cgpa: { $gte: drive.eligibilityCriteria.minCGPA },
        'placementStatus.isPlaced': false,
      }).populate('userId', 'email');

      for (const student of eligibleStudents) {
        const hasApplied = await Application.findOne({
          studentId: student._id,
          driveId: drive._id,
        });

        if (!hasApplied) {
          await createNotification({
            recipientId: student.userId._id,
            type: 'drive_announcement',
            title: 'Application Deadline Tomorrow',
            message: `The application deadline for ${drive.companyName} - ${drive.jobTitle} is tomorrow. Don't miss out!`,
            relatedEntity: {
              entityType: 'drive',
              entityId: drive._id,
            },
            priority: 'high',
          });

          await sendEmail({
            email: student.userId.email,
            subject: `Reminder: Application Deadline Tomorrow - ${drive.companyName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #F59E0B;">Application Deadline Reminder</h2>
                <p>Dear ${student.firstName},</p>
                <p>This is a reminder that the application deadline for the following drive is <strong>tomorrow</strong>:</p>
                <ul>
                  <li><strong>Company:</strong> ${drive.companyName}</li>
                  <li><strong>Position:</strong> ${drive.jobTitle}</li>
                  <li><strong>CTC:</strong> ₹${drive.ctc.min} - ₹${drive.ctc.max || drive.ctc.min} LPA</li>
                  <li><strong>Deadline:</strong> ${new Date(drive.applicationDeadline).toLocaleDateString()}</li>
                </ul>
                <p>Login to your account to apply now!</p>
                <br>
                <p>Best regards,</p>
                <p><strong>HireSphere Team</strong></p>
              </div>
            `,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending deadline reminders:', error.message);
  }
};

const sendInterviewReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const applications = await Application.find({
      'interviewDetails.scheduledDate': {
        $gte: today,
        $lte: endOfToday,
      },
      status: 'interview_scheduled',
    })
      .populate('studentId', 'firstName lastName')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'email' },
      })
      .populate('driveId', 'companyName jobTitle');

    for (const application of applications) {
      const todayInterviews = application.interviewDetails.filter((interview) => {
        const interviewDate = new Date(interview.scheduledDate);
        return interviewDate >= today && interviewDate <= endOfToday;
      });

      if (todayInterviews.length > 0) {
        for (const interview of todayInterviews) {
          await createNotification({
            recipientId: application.studentId.userId._id,
            type: 'interview_schedule',
            title: 'Interview Today',
            message: `You have an interview scheduled today for ${application.driveId.jobTitle} at ${application.driveId.companyName}`,
            relatedEntity: {
              entityType: 'application',
              entityId: application._id,
            },
            priority: 'high',
          });

          await sendEmail({
            email: application.studentId.userId.email,
            subject: `Interview Reminder - ${application.driveId.companyName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Interview Reminder</h2>
                <p>Dear ${application.studentId.firstName},</p>
                <p>This is a reminder that you have an interview scheduled <strong>today</strong>:</p>
                <ul>
                  <li><strong>Company:</strong> ${application.driveId.companyName}</li>
                  <li><strong>Position:</strong> ${application.driveId.jobTitle}</li>
                  <li><strong>Round:</strong> ${interview.round}</li>
                  <li><strong>Time:</strong> ${new Date(interview.scheduledDate).toLocaleTimeString()}</li>
                  ${interview.interviewerName ? `<li><strong>Interviewer:</strong> ${interview.interviewerName}</li>` : ''}
                </ul>
                <p>Best of luck!</p>
                <br>
                <p>Best regards,</p>
                <p><strong>HireSphere Team</strong></p>
              </div>
            `,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending interview reminders:', error.message);
  }
};

const closeExpiredDrives = async () => {
  try {
    const now = new Date();

    const expiredDrives = await Drive.find({
      status: 'published',
      applicationDeadline: { $lt: now },
    });

    for (const drive of expiredDrives) {
      drive.status = 'closed';
      await drive.save();
    }

    if (expiredDrives.length > 0) {
      console.log(`Closed ${expiredDrives.length} expired drives`);
    }
  } catch (error) {
    console.error('Error closing expired drives:', error.message);
  }
};

const sendOfferExpiryReminders = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const endOfDay = new Date(threeDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    const expiringOffers = await Offer.find({
      status: 'pending',
      validUntil: {
        $gte: threeDaysFromNow,
        $lte: endOfDay,
      },
    })
      .populate('studentId', 'firstName lastName')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'email' },
      })
      .populate('driveId', 'companyName');

    for (const offer of expiringOffers) {
      await createNotification({
        recipientId: offer.studentId.userId._id,
        type: 'offer_received',
        title: 'Offer Expiring Soon',
        message: `Your offer from ${offer.driveId.companyName} will expire in 3 days. Please respond soon.`,
        relatedEntity: {
          entityType: 'offer',
          entityId: offer._id,
        },
        priority: 'high',
      });

      await sendEmail({
        email: offer.studentId.userId.email,
        subject: `Offer Expiring Soon - ${offer.driveId.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F59E0B;">Offer Expiry Reminder</h2>
            <p>Dear ${offer.studentId.firstName},</p>
            <p>This is a reminder that your offer from <strong>${offer.driveId.companyName}</strong> will expire in <strong>3 days</strong>.</p>
            <p><strong>Position:</strong> ${offer.offerDetails.designation}</p>
            <p><strong>CTC:</strong> ₹${offer.offerDetails.ctc} LPA</p>
            <p><strong>Valid Until:</strong> ${new Date(offer.validUntil).toLocaleDateString()}</p>
            <p>Please login to your account and respond to the offer before it expires.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>HireSphere Team</strong></p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error('Error sending offer expiry reminders:', error.message);
  }
};
