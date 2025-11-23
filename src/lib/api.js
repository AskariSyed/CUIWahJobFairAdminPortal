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

export default api;