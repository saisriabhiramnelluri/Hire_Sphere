import api from './api';

export const interviewService = {
    // Schedule a new interview
    scheduleInterview: async (data) => {
        return await api.post('/interviews', data);
    },

    // Get interview by room ID
    getInterviewByRoom: async (roomId) => {
        return await api.get(`/interviews/room/${roomId}`);
    },

    // Get recruiter's interviews
    getRecruiterInterviews: async (status) => {
        const params = status ? { status } : {};
        return await api.get('/interviews/recruiter', { params });
    },

    // Get student's interviews
    getStudentInterviews: async (status) => {
        const params = status ? { status } : {};
        return await api.get('/interviews/student', { params });
    },

    // Get interviews for an application
    getApplicationInterviews: async (applicationId) => {
        return await api.get(`/interviews/application/${applicationId}`);
    },

    // Update interview status
    updateStatus: async (id, data) => {
        return await api.patch(`/interviews/${id}/status`, data);
    },

    // Submit feedback
    submitFeedback: async (id, data) => {
        return await api.post(`/interviews/${id}/feedback`, data);
    },

    // Cancel interview
    cancelInterview: async (id, reason) => {
        return await api.patch(`/interviews/${id}/cancel`, { reason });
    },
};
