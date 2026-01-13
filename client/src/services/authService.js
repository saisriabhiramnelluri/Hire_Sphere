import api from './api';

export const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    return await api.post(`/auth/reset-password/${token}`, { password });
  },

  changePassword: async (currentPassword, newPassword) => {
    return await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },
};
