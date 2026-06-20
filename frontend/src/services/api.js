import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updatePassword: (data) => api.put('/auth/updatepassword', data),
    forgotPassword: (data) => api.post('/auth/forgotpassword', data),
    resetPassword: (token, data) => api.put(`/auth/resetpassword/${token}`, data)
};

// Volunteers API
export const volunteerAPI = {
    getAll: (params) => api.get('/volunteers', { params }),
    getLeaderboard: (params) => api.get('/volunteers/leaderboard', { params }),
    getOne: (id) => api.get(`/volunteers/${id}`),
    updateProfile: (data) => api.put('/volunteers/profile', data),
    uploadPhoto: (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        return api.post('/volunteers/profile/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    uploadIdProof: (file) => {
        const formData = new FormData();
        formData.append('idProof', file);
        return api.post('/volunteers/profile/idproof', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    uploadResume: (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        return api.post('/volunteers/profile/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// Events API
export const eventAPI = {
    getAll: (params) => api.get('/events', { params }),
    getUpcoming: () => api.get('/events/upcoming'),
    getOne: (id) => api.get(`/events/${id}`),
    create: (data) => {
        if (data instanceof FormData) {
            return api.post('/events', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/events', data);
    },
    update: (id, data) => {
        if (data instanceof FormData) {
            return api.put(`/events/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/events/${id}`, data);
    },
    delete: (id) => api.delete(`/events/${id}`),
    register: (id) => api.post(`/events/${id}/register`),
    cancel: (id) => api.post(`/events/${id}/cancel`),
    generateQR: (id, type) => api.post(`/events/${id}/qrcode`, { type })
};

// Attendance API
export const attendanceAPI = {
    checkIn: (data) => api.post('/attendance/checkin', data),
    checkOut: (data) => api.post('/attendance/checkout', data),
    getMyAttendance: () => api.get('/attendance/my'),
    getEventAttendance: (eventId) => api.get(`/attendance/event/${eventId}`),
    adminCheckIn: (data) => api.post('/attendance/admin/checkin', data),
    adminCheckOut: (data) => api.post('/attendance/admin/checkout', data)
};

// Certificates API
export const certificateAPI = {
    getMyCertificates: () => api.get('/certificates'),
    getOne: (id) => api.get(`/certificates/${id}`),
    download: (id) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
    generate: (eventId, volunteerId) => api.post(`/certificates/generate/${eventId}/${volunteerId}`),
    generateBulk: (eventId) => api.post(`/certificates/generate-bulk/${eventId}`)
};

// Feedback API
export const feedbackAPI = {
    submitVolunteerFeedback: (data) => api.post('/feedback/volunteer', data),
    submitOrganizerFeedback: (data) => api.post('/feedback/organizer', data),
    getEventFeedback: (eventId) => api.get(`/feedback/event/${eventId}`),
    getMyFeedback: () => api.get('/feedback/my'),
    getFeedbackStats: (eventId) => api.get(`/feedback/stats/${eventId}`)
};

// Notifications API
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    getUnreadCount: () => api.get('/notifications/unread-count')
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    approveVolunteer: (id) => api.put(`/admin/volunteers/${id}/approve`),
    rejectVolunteer: (id, data) => api.put(`/admin/volunteers/${id}/reject`, data),
    updateVolunteerStatus: (id, data) => api.put(`/admin/volunteers/${id}/status`, data),
    deleteVolunteer: (id) => api.delete(`/admin/volunteers/${id}`),
    getPendingVolunteers: () => api.get('/admin/volunteers/pending'),
    exportVolunteers: (params) => api.get('/admin/export/volunteers', { params, responseType: 'blob' }),
    exportEvents: (params) => api.get('/admin/export/events', { params, responseType: 'blob' }),
    exportAttendance: (params) => api.get('/admin/export/attendance', { params, responseType: 'blob' }),
    getReports: (params) => api.get('/admin/reports', { params }),
    createAdmin: (data) => api.post('/admin/create-admin', data)
};

export default api;
