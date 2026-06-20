import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add JWT token to request headers
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
            // If they aren't on the login or signup page, redirect to login
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup') && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    downloadCertificate: () => api.get('/auth/certificate', { responseType: 'blob' })
};

// Admin endpoints
export const adminAPI = {
    getVolunteers: (params) => api.get('/admin/volunteers', { params }),
    updateVolunteerStatus: (id, status) => api.patch(`/admin/volunteers/${id}/status`, { status }),
    exportCSV: (params) => api.get('/admin/reports/csv', { params, responseType: 'blob' }),
    exportPDF: () => api.get('/admin/reports/pdf', { responseType: 'blob' })
};

// Drive endpoints
export const driveAPI = {
    getDrives: () => api.get('/drives'),
    registerDrive: (id) => api.post(`/drives/${id}/register`),
    unregisterDrive: (id) => api.post(`/drives/${id}/unregister`),
    createDrive: (data) => api.post('/drives', data),
    updateDrive: (id, data) => api.put(`/drives/${id}`, data),
    deleteDrive: (id) => api.delete(`/drives/${id}`)
};

export default api;
