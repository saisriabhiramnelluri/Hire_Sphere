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

export const APPLICATION_STATUS_LABELS = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  test_scheduled: 'Test Scheduled',
  test_cleared: 'Test Cleared',
  interview_scheduled: 'Interview Scheduled',
  interview_cleared: 'Interview Cleared',
  offered: 'Offered',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const APPLICATION_STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  test_scheduled: 'bg-yellow-100 text-yellow-800',
  test_cleared: 'bg-green-100 text-green-800',
  interview_scheduled: 'bg-orange-100 text-orange-800',
  interview_cleared: 'bg-teal-100 text-teal-800',
  offered: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
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

export const JOB_TYPE_LABELS = {
  full_time: 'Full Time',
  internship: 'Internship',
  both: 'Full Time & Internship',
};

export const WORK_MODES = {
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
};

export const WORK_MODE_LABELS = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

export const NOTIFICATION_TYPES = {
  DRIVE_ANNOUNCEMENT: 'drive_announcement',
  APPLICATION_UPDATE: 'application_update',
  INTERVIEW_SCHEDULE: 'interview_schedule',
  OFFER_RECEIVED: 'offer_received',
  GENERAL: 'general',
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};
