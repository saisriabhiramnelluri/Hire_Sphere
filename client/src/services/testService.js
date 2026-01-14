import api from './api';

export const testService = {
    // ==================== RECRUITER ENDPOINTS ====================

    // Create a new test
    createTest: async (data) => {
        return await api.post('/tests', data);
    },

    // Update a test
    updateTest: async (id, data) => {
        return await api.put(`/tests/${id}`, data);
    },

    // Delete a test
    deleteTest: async (id) => {
        return await api.delete(`/tests/${id}`);
    },

    // Get test by ID
    getTestById: async (id) => {
        return await api.get(`/tests/${id}`);
    },

    // Get recruiter's tests
    getRecruiterTests: async (params = {}) => {
        return await api.get('/tests/recruiter', { params });
    },

    // Publish a test
    publishTest: async (id) => {
        return await api.post(`/tests/${id}/publish`);
    },

    // Schedule test for applicant
    scheduleTest: async (data) => {
        return await api.post('/tests/schedule', data);
    },

    // Get test submissions
    getTestSubmissions: async (testId) => {
        return await api.get(`/tests/${testId}/submissions`);
    },

    // Assign test to applicants
    assignTestToApplicants: async (data) => {
        return await api.post('/tests/assign', data);
    },

    // Generate questions using AI
    generateAIQuestions: async (data) => {
        return await api.post('/tests/generate-questions', data);
    },

    // ==================== STUDENT ENDPOINTS ====================

    // Get student's scheduled tests
    getStudentTests: async (params = {}) => {
        return await api.get('/submissions/student', { params });
    },

    // Start a test
    startTest: async (submissionId) => {
        return await api.post(`/submissions/start/${submissionId}`);
    },

    // Submit MCQ answer
    submitMcqAnswer: async (submissionId, questionIndex, selectedOption) => {
        return await api.post(`/submissions/${submissionId}/answer`, {
            questionIndex,
            selectedOption,
        });
    },

    // Run code (without submitting)
    runCode: async (code, language, input) => {
        return await api.post('/submissions/run-code', {
            code,
            language,
            input,
        });
    },

    // Submit code
    submitCode: async (submissionId, questionIndex, code, language) => {
        return await api.post(`/submissions/${submissionId}/code`, {
            questionIndex,
            code,
            language,
        });
    },

    // Finalize test submission
    finalizeTest: async (submissionId) => {
        return await api.post(`/submissions/${submissionId}/finalize`);
    },

    // Get submission report
    getSubmissionReport: async (submissionId) => {
        return await api.get(`/submissions/${submissionId}/report`);
    },

    // Get AI-powered test review
    getAITestReview: async (submissionId) => {
        return await api.get(`/submissions/${submissionId}/ai-review`);
    },

    // Record proctoring event
    recordProctoringEvent: async (submissionId, eventType) => {
        return await api.post(`/submissions/${submissionId}/proctoring`, {
            eventType,
        });
    },
};

export default testService;
