import api from './api';

export const driveService = {
  getAllDrives: async (params) => {
    return await api.get('/drives', { params });
  },

  getDriveById: async (id) => {
    return await api.get(`/drives/${id}`);
  },

  getDriveStatistics: async (id) => {
    return await api.get(`/drives/${id}/statistics`);
  },

  createDrive: async (driveData) => {
    return await api.post('/recruiter/drives', driveData);
  },

  updateDrive: async (id, driveData) => {
    return await api.patch(`/recruiter/drives/${id}`, driveData);
  },

  closeDrive: async (id) => {
    return await api.patch(`/recruiter/drives/${id}/close`);
  },

  getMyDrives: async (params) => {
    return await api.get('/recruiter/drives', { params });
  },

  getEligibleDrives: async (params) => {
    return await api.get('/student/drives', { params });
  },
};
