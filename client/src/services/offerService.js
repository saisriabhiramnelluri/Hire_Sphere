import api from './api';

export const offerService = {
  getOfferById: async (id) => {
    return await api.get(`/offers/${id}`);
  },

  getMyOffers: async () => {
    return await api.get('/student/offers');
  },

  respondToOffer: async (id, decision, remarks) => {
    return await api.patch(`/offers/${id}/respond`, { decision, remarks });
  },

  uploadJoiningConfirmation: async (id, formData) => {
    return await api.post(`/offers/${id}/joining-confirmation`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  createOffer: async (applicationId, formData) => {
    return await api.post(`/recruiter/applications/${applicationId}/offer`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
