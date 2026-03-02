import axios from 'axios';

// 1. Define the Base URL (Root of your .NET Backend)
// Change this ONE place if your port changes (e.g. to 5158 for HTTP)
export const BACKEND_URL = 'http://192.168.137.1:5158'; 

// 2. Define the API URL
const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor for Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerCompanyForFair = (companyId, jobFairId) => {
  const query = jobFairId ? `?jobFairId=${jobFairId}` : '';
  return api.post(`/admin/companies/${companyId}/register-for-fair${query}`);
};

export const registerStudentForFair = (studentId, jobFairId) => {
  const query = jobFairId ? `?jobFairId=${jobFairId}` : '';
  return api.post(`/admin/students/${studentId}/register-for-fair${query}`);
};

export const tentativelyAssignRoom = (companyId, roomId) => {
  return api.put(`/admin/rooms/tentatively-assign?companyId=${companyId}&roomId=${roomId}`);
};

export const confirmRoomAllotment = (roomId) => {
  return api.put(`/admin/rooms/${roomId}/confirm-allotment`);
};

// --- Notifications ---
export const notifyCompany = (companyId, data) => api.post(`/admin/companies/${companyId}/notify`, data);
export const notifyAllCompanies = (data) => api.post(`/admin/companies/notify-all`, data);

// --- Global Student List (Regardless of Participation) ---
export const getAllStudentsGlobal = (page = 1, search = '', department = '') => {
  const query = `?page=${page}&pageSize=20&search=${encodeURIComponent(search)}&department=${encodeURIComponent(department)}`;
  return api.get(`/admin/students/all${query}`);
};

// --- Attendance Management ---
export const getAllJobFairs = () => {
  // Get all job fairs without pagination limit
  return api.get('/admin/jobfairs?page=1&pageSize=1000');
};

export const getCompaniesForJobFair = (jobFairId) => {
  return api.get(`/admin/jobfairs/${jobFairId}/companies`);
};

export const startAttendanceSession = (jobFairId) => {
  return api.post(`/Attendance/start-session`, {
    jobFairId
  });
};

export const endAttendanceSession = (sessionToken) => {
  return api.post(`/Attendance/end-session`, {
    sessionToken
  });
};

export const getAttendanceStats = (jobFairId) => {
  return api.get(`/Attendance/stats/${jobFairId}`);
};

// --- Job Fair management ---
export const deleteJobFair = (jobFairId) => api.delete(`/admin/jobfairs/${jobFairId}`);
export const activateJobFair = (jobFairId) => api.post(`/admin/jobfairs/${jobFairId}/activate`);
export const updateJobFair = (jobFairId, data) => api.put(`/admin/jobfairs/${jobFairId}`, data);

// --- Student credentials ---
export const updateStudentCredentials = (studentId, data) => api.put(`/admin/students/${studentId}/edit-credentials`, data);

export default api;