export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  RECRUITER: 'recruiter',
};

export const DRIVE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  CLOSED: 'closed',
};

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  TEST_SCHEDULED: 'test_scheduled',
  TEST_CLEARED: 'test_cleared',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_CLEARED: 'interview_cleared',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export const OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export const NOTIFICATION_TYPES = {
  DRIVE_ANNOUNCEMENT: 'drive_announcement',
  APPLICATION_UPDATE: 'application_update',
  INTERVIEW_SCHEDULE: 'interview_schedule',
  OFFER_RECEIVED: 'offer_received',
  GENERAL: 'general',
};

export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Aerospace Engineering',
  'Other',
];

export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  INTERNSHIP: 'internship',
  BOTH: 'both',
};

export const FILE_TYPES = {
  RESUME: 'resume',
  OFFER_LETTER: 'offer_letter',
  DOCUMENT: 'document',
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = {
  RESUME: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DOCUMENT: ['application/pdf', 'image/jpeg', 'image/png'],
};
