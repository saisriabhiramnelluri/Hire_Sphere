import api from './api';

export const userService = {
  getProfile: async () => {
    return await api.get('/student/profile');
  },

  createProfile: async (profileData) => {
    return await api.post('/student/profile', profileData);
  },

  updateProfile: async (profileData) => {
    return await api.patch('/student/profile', profileData);
  },

  uploadResume: async (formData) => {
    return await api.post('/student/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteResume: async (resumeId) => {
    return await api.delete(`/student/resume/${resumeId}`);
  },

  uploadPhoto: async (formData) => {
    return await api.post('/student/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getRecruiterProfile: async () => {
    return await api.get('/recruiter/profile');
  },

  createRecruiterProfile: async (profileData) => {
    return await api.post('/recruiter/profile', profileData);
  },

  updateRecruiterProfile: async (profileData) => {
    return await api.patch('/recruiter/profile', profileData);
  },

  uploadCompanyLogo: async (formData) => {
    // Don't set Content-Type - let axios set it with proper boundary for multipart
    return await api.post('/recruiter/logo', formData, {
      headers: {
        'Content-Type': undefined,
      },
      transformRequest: [(data) => data], // Prevent any transformation
    });
  },
};

