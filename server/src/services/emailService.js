import { sendEmail } from '../config/email.js';

export const sendWelcomeEmail = async (userEmail, userName) => {
  await sendEmail({
    email: userEmail,
    subject: 'Welcome to HireSphere',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to HireSphere!</h2>
        <p>Dear ${userName},</p>
        <p>Your account has been successfully created. We're excited to have you on board.</p>
        <p>Please complete your profile to get started with the placement process.</p>
        <p>If you have any questions, feel free to reach out to us.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>HireSphere Team</strong></p>
      </div>
    `,
  });
};

export const sendApplicationStatusEmail = async (userEmail, companyName, jobTitle, status) => {
  const statusMessages = {
    shortlisted: 'Congratulations! You have been shortlisted',
    test_scheduled: 'Your test has been scheduled',
    interview_scheduled: 'Your interview has been scheduled',
    offered: 'Congratulations! You have received an offer',
    rejected: 'Thank you for your application',
  };

  await sendEmail({
    email: userEmail,
    subject: `Application Update - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Application Status Update</h2>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
        <p><strong>Status:</strong> ${statusMessages[status] || status}</p>
        <p>Please login to your account for more details.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>HireSphere Team</strong></p>
      </div>
    `,
  });
};

export const sendDriveAnnouncementEmail = async (userEmail, companyName, jobTitle, deadline) => {
  await sendEmail({
    email: userEmail,
    subject: `New Drive Announcement - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Placement Drive!</h2>
        <p>A new placement drive has been announced that matches your profile.</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Application Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
        <p>Login to your account to view details and apply.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>HireSphere Team</strong></p>
      </div>
    `,
  });
};

export const sendOfferEmail = async (userEmail, studentName, companyName, designation, ctc) => {
  await sendEmail({
    email: userEmail,
    subject: `Offer Letter - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Congratulations!</h2>
        <p>Dear ${studentName},</p>
        <p>We are pleased to inform you that you have received an offer from <strong>${companyName}</strong>.</p>
        <p><strong>Position:</strong> ${designation}</p>
        <p><strong>CTC:</strong> ₹${ctc} LPA</p>
        <p>Please login to your account to view and respond to the offer letter.</p>
        <br>
        <p>Best wishes,</p>
        <p><strong>HireSphere Team</strong></p>
      </div>
    `,
  });
};

export const sendRecruiterApprovalEmail = async (userEmail, companyName, isApproved) => {
  const subject = isApproved ? 'Account Approved' : 'Account Application Status';
  const message = isApproved
    ? 'Your recruiter account has been approved. You can now create and manage placement drives.'
    : 'Your recruiter account application is under review. We will notify you once it is processed.';

  await sendEmail({
    email: userEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">${subject}</h2>
        <p>Dear ${companyName} Team,</p>
        <p>${message}</p>
        <p>If you have any questions, please contact the placement cell.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>HireSphere Team</strong></p>
      </div>
    `,
  });
};
