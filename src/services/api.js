import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || '/api';
if (rawApiUrl && rawApiUrl.startsWith('http') && !rawApiUrl.endsWith('/api')) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '') + '/api';
}

const API = axios.create({
  baseURL: rawApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to all requests if present
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

// Response Interceptor: Handle 401 Unauthorized globally & try refresh token once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('cms_refresh_token');
      if (refreshToken && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return API(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(rawApiUrl + '/auth/refresh-token', {
            refreshToken: refreshToken,
          });

          if (res.data && res.data.token) {
            localStorage.setItem('cms_token', res.data.token);
            if (res.data.refreshToken) {
              localStorage.setItem('cms_refresh_token', res.data.refreshToken);
            }
            processQueue(null, res.data.token);
            originalRequest.headers['Authorization'] = 'Bearer ' + res.data.token;
            return API(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('cms_token');
          localStorage.removeItem('cms_refresh_token');
          localStorage.removeItem('cms_user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
            window.location.href = '/login?expired=true';
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_refresh_token');
        localStorage.removeItem('cms_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  refreshToken: (data) => API.post('/auth/refresh-token', data),
  logout: () => API.post('/auth/logout', null, { params: { refreshToken: localStorage.getItem('cms_refresh_token') } }),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
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
  getReceiptBlob: (id) => API.get(`/complaints/${id}/receipt`, { responseType: 'blob' }),
  getNotifications: () => API.get('/notifications'),
  markNotificationRead: (id) => API.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => API.put('/notifications/mark-all-read'),
};

// Comment Service (Two-way activity feed)
export const commentService = {
  getComments: (complaintId) => API.get(`/complaints/${complaintId}/comments`),
  addComment: (complaintId, data) => API.post(`/complaints/${complaintId}/comments`, data),
};

// Staff Portal Service (ROLE_STAFF)
export const staffPortalService = {
  getDashboardStats: () => API.get('/staff-portal/dashboard/stats'),
  getMyComplaints: (params) => API.get('/staff-portal/my-complaints', { params }),
  updateComplaintStatus: (id, data) => API.put(`/staff-portal/complaints/${id}/status`, data),
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
  exportCsvBlob: (params) => API.get('/admin/reports/export/csv', { params, responseType: 'blob' }),
  exportPdfBlob: (params) => API.get('/admin/reports/export/pdf', { params, responseType: 'blob' }),
  
  // Departments
  getDepartments: (params) => API.get('/departments', { params }),
  createDepartment: (data) => API.post('/departments', data),
  updateDepartment: (id, data) => API.put(`/departments/${id}`, data),
  toggleDepartmentStatus: (id) => API.put(`/departments/${id}/toggle`),

  // Staff
  getStaff: (params) => API.get('/staff', { params }),
  createStaff: (data) => API.post('/staff', data),
  updateStaff: (id, data) => API.put(`/staff/${id}`, data),
  toggleStaffStatus: (id) => API.put(`/staff/${id}/toggle`),

  // Users
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUserStatus: (id) => API.put(`/admin/users/${id}/toggle`),

  // Feedbacks
  getAllFeedbacks: () => API.get('/admin/feedback'),
};

// Public Service
export const publicService = {
  getPublicDepartments: () => API.get('/departments'),
  trackComplaint: (complaintNumber) => API.get(`/public/complaints/track/${complaintNumber}`),
};

export default API;
