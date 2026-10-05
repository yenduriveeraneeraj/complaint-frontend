import axios from 'axios';

// Create Axios instance pointing to backend REST API
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token to all requests if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

// Complaint Service (User)
export const complaintService = {
  submitComplaint: (formData) =>
    API.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUserComplaints: (params) => API.get('/complaints', { params }),
  getComplaintById: (id) => API.get(`/complaints/${id}`),
  getComplaintHistory: (id) => API.get(`/complaints/${id}/history`),
  getNotifications: () => API.get('/notifications'),
  markNotificationRead: (id) => API.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => API.put('/notifications/mark-all-read'),
};

// Feedback Service
export const feedbackService = {
  submitFeedback: (data) => API.post('/feedback', data),
};

// Admin Service
export const adminService = {
  getDashboardStats: () => API.get('/admin/dashboard'),
  getChartData: () => API.get('/admin/reports/charts'),
  getAllComplaints: (params) => API.get('/admin/complaints', { params }),
  updateComplaintStatus: (id, data) => API.put(`/admin/complaints/${id}/status`, data),
  assignStaff: (id, data) => API.put(`/admin/complaints/${id}/assign`, data),
  
  // Departments
  getDepartments: () => API.get('/departments'),
  createDepartment: (data) => API.post('/departments', data),
  updateDepartment: (id, data) => API.put(`/departments/${id}`, data),
  toggleDepartmentStatus: (id) => API.put(`/departments/${id}/toggle`),

  // Staff
  getStaff: () => API.get('/staff'),
  createStaff: (data) => API.post('/staff', data),
  toggleStaffStatus: (id) => API.put(`/staff/${id}/toggle`),

  // Users
  getUsers: () => API.get('/admin/users'),
  toggleUserStatus: (id) => API.put(`/admin/users/${id}/toggle`),

  // Feedbacks
  getAllFeedbacks: () => API.get('/admin/feedback'),
};

// Public Service
export const publicService = {
  getPublicDepartments: () => API.get('/departments'),
};

export default API;
