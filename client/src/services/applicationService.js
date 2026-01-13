import api from './api';

export const applicationService = {
  createApplication: async (applicationData) => {
    return await api.post('/applications', applicationData);
  },

  getApplicationById: async (id) => {
    return await api.get(`/applications/${id}`);
  },

  getMyApplications: async (params) => {
    return await api.get('/student/applications', { params });
  },

  withdrawApplication: async (id) => {
    return await api.patch(`/applications/${id}/withdraw`);
  },

  getApplicants: async (driveId, params) => {
    return await api.get(`/recruiter/drives/${driveId}/applicants`, { params });
  },

  shortlistApplicants: async (applicationIds) => {
    return await api.post('/recruiter/applicants/shortlist', { applicationIds });
  },

  rejectApplicants: async (applicationIds, reason) => {
    return await api.post('/recruiter/applicants/reject', {
      applicationIds,
      reason,
    });
  },

  updateApplicationStatus: async (id, status, remarks) => {
    return await api.patch(`/recruiter/applications/${id}/status`, {
      status,
      remarks,
    });
  },

  addInterviewFeedback: async (id, feedbackData) => {
    return await api.post(`/recruiter/applications/${id}/interview-feedback`, feedbackData);
  },
};
